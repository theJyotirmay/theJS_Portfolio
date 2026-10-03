const fs = require('fs');

const md = fs.readFileSync('C:/Users/eye07/.gemini/antigravity-ide/brain/59f57b84-8fa4-40ea-93a4-80575037858d/.system_generated/steps/5/content.md', 'utf8');
const match = md.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!match) {
  console.log('No body found');
  process.exit(1);
}

let bodyHtml = match[1];

// Remove the Next.js script tags at the end of body
bodyHtml = bodyHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
bodyHtml = bodyHtml.replace(/<next-route-announcer[^>]*>[\s\S]*?<\/next-route-announcer>/gi, '');

// Convert to JSX
let jsx = bodyHtml
  .replace(/class=/g, 'className=')
  .replace(/for=/g, 'htmlFor=')
  .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
  .replace(/style="([^"]*)"/g, (match, styleStr) => {
    const styles = styleStr.split(';').filter(s => s.trim());
    const styleObj = {};
    styles.forEach(s => {
      const [key, value] = s.split(':');
      if (key && value) {
        const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        styleObj[camelKey] = value.trim();
      }
    });
    return `style={${JSON.stringify(styleObj)}}`;
  })
  .replace(/<img([^>]*)>/g, (match, attrs) => {
    if (attrs.endsWith('/')) return match;
    return `<img${attrs} />`;
  })
  .replace(/<input([^>]*)>/g, (match, attrs) => {
    if (attrs.endsWith('/')) return match;
    return `<input${attrs} />`;
  })
  .replace(/<br([^>]*)>/g, (match, attrs) => {
    if (attrs.endsWith('/')) return match;
    return `<br${attrs} />`;
  })
  .replace(/<hr([^>]*)>/g, (match, attrs) => {
    if (attrs.endsWith('/')) return match;
    return `<hr${attrs} />`;
  })
  // fix specific svg tags like viewBox
  .replace(/viewbox/gi, 'viewBox')
  .replace(/stroke-width/gi, 'strokeWidth')
  .replace(/stroke-linecap/gi, 'strokeLinecap')
  .replace(/stroke-linejoin/gi, 'strokeLinejoin')
  .replace(/fill-rule/gi, 'fillRule')
  .replace(/clip-rule/gi, 'clipRule')
  .replace(/preserveaspectratio/gi, 'preserveAspectRatio')
  // remove problematic Next.js paths for images
  .replace(/\/_next\/static\/media\//g, '/')
  // fix data-nimg
  .replace(/data-nimg="([^"]*)"/g, '')
  .replace(/decoding="async"/g, 'decoding="async"');


const out = `
"use client";
import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Some simple GSAP animations as per original
    gsap.utils.toArray('.transition-all').forEach((el: any) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: el, start: 'top 80%' } });
    });
  }, []);

  return (
    <>
      ${jsx}
    </>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', out);
console.log('page.tsx generated');
