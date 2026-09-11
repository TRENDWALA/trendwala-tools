/**
 * TrendWala Tools - Categories Configuration
 */

module.exports = {
  'image-tools': {
    id: 'image-tools',
    name: 'Image Tools',
    slug: 'image-tools',
    title: 'Free Online Image Tools & Converters | TrendWala Tools',
    metaDescription: 'Free, fast, and private online image tools. Convert HEIC to JPG, compress images, resize, crop, rotate, and convert to WebP or PNG directly in your browser.',
    icon: 'image',
    badge: '12 Tools',
    h1: 'Online Image Tools & Converters',
    subtitle: 'Convert, compress, resize, crop, and transform your images privately in your browser without uploading to any remote server.',
    description: 'Our comprehensive suite of browser-based image tools lets you convert Apple HEIC photos, compress large JPG and PNG images, crop photos with aspect ratio presets, resize dimensions with pixel precision, and rotate images with zero loss of quality. Everything runs locally on your device for unmatched speed, privacy, and security.',
    features: [
      {
        title: '100% Private & Local',
        desc: 'Images are processed inside your browser memory using HTML5 Canvas & WebAssembly. Your photos are never sent to our servers.'
      },
      {
        title: 'Lightning Fast',
        desc: 'Zero upload lag. Conversions and compressions begin immediately on your device hardware without waiting for network transfers.'
      },
      {
        title: 'Batch Processing',
        desc: 'Convert or compress multiple photos simultaneously and download all results in a single convenient ZIP archive.'
      },
      {
        title: 'High Quality Preservation',
        desc: 'Fine-tune image compression and quality settings with real-time before/after size comparisons to retain crisp visuals.'
      }
    ],
    faqs: [
      {
        q: 'Are my images uploaded to any server when using these tools?',
        a: 'No. Every image tool on TrendWala Tools executes 100% client-side inside your web browser. Your private photos, screenshots, and scans never leave your device.'
      },
      {
        q: 'Can I convert HEIC photos from my iPhone to JPG or PNG?',
        a: 'Yes! Our HEIC to JPG, HEIC to PNG, and HEIC to WebP converters support real Apple iOS/macOS HEIC and HEIF photos, including multi-file batch conversions with ZIP download.'
      },
      {
        q: 'Is there any file size or conversion limit?',
        a: 'Because processing happens on your local device, there are no artificial server limits. You can process as many images as your browser memory can handle.'
      },
      {
        q: 'Do these image tools work on mobile phones?',
        a: 'Yes. All our image tools are fully responsive and work seamlessly on mobile browsers including Safari on iPhone and Chrome on Android.'
      }
    ]
  },

  'pdf-tools': {
    id: 'pdf-tools',
    name: 'PDF Tools',
    slug: 'pdf-tools',
    title: 'Free Online PDF Tools — Merge, Split, Rotate & Convert | TrendWala Tools',
    metaDescription: 'Private online PDF tools that run in your browser. Merge PDFs, split pages, rotate documents, convert images to PDF and PDF to JPG without server uploads.',
    icon: 'file-text',
    badge: '6 Tools',
    h1: 'Online PDF Tools & Document Utilities',
    subtitle: 'Merge, split, rotate, and convert PDF documents privately inside your browser without uploading sensitive files.',
    description: 'Work with confidential contracts, invoices, and documents with complete peace of mind. Our client-side PDF tools allow you to merge multiple PDF files, extract page ranges, rotate orientations, combine JPG/PNG photos into clean PDF documents, and render PDF pages to high-resolution JPG images.',
    features: [
      {
        title: 'Confidential & Secure',
        desc: 'Legal agreements, financial reports, and tax documents remain strictly on your computer. Zero server uploads.'
      },
      {
        title: 'Precision PDF Manipulation',
        desc: 'Rearrange pages, extract individual sheets or custom ranges, and rotate pages in 90-degree increments with instant preview.'
      },
      {
        title: 'Multi-Image PDF Creation',
        desc: 'Combine multiple JPG, PNG, and WebP images into a single professional PDF with custom margins and orientations.'
      },
      {
        title: 'High Resolution Extraction',
        desc: 'Convert PDF document pages to crisp JPG images for easy sharing and presentation slides.'
      }
    ],
    faqs: [
      {
        q: 'How does TrendWala Tools process PDFs without uploading them?',
        a: 'We use modern client-side WebAssembly and JavaScript libraries (such as PDF-Lib and PDF.js) directly in your browser. The file bytes are parsed and rewritten in local browser memory.'
      },
      {
        q: 'Can I reorder PDF files before merging them?',
        a: 'Yes, our PDF Merger lets you drag and drop or reorder your PDF files before merging them into a single continuous file.'
      },
      {
        q: 'How do I extract only specific pages from a large PDF?',
        a: 'Use our PDF Splitter. You can enter specific pages or ranges like "1-3, 5, 8-10" or split every page into separate individual documents.'
      }
    ]
  },

  'text-tools': {
    id: 'text-tools',
    name: 'Text Tools',
    slug: 'text-tools',
    title: 'Free Online Text Tools — Word Counter, Case Converter & Cleaners | TrendWala Tools',
    metaDescription: 'Fast, browser-based text analysis and manipulation tools. Count words and characters, convert letter case, remove duplicate lines, sort text, and clean formatting.',
    icon: 'type',
    badge: '6 Tools',
    h1: 'Online Text Analysis & Editing Tools',
    subtitle: 'Instant word counting, case conversion, line deduplication, sorting, and cleaning for writers, students, and professionals.',
    description: 'Streamline your writing and data preparation workflows. Whether you need to verify word counts for academic essays, format titles for publishing, sort large lists alphabetically, or eliminate duplicate entries from data sets, our text tools give you instant, real-time results right in your browser.',
    features: [
      {
        title: 'Instant Real-Time Calculations',
        desc: 'Metrics update as you type or paste without clicking calculate or waiting for network roundtrips.'
      },
      {
        title: 'Social Media Limits',
        desc: 'Track exact character limits for Twitter/X (280), SMS (160), Instagram captions (2,200), and meta descriptions.'
      },
      {
        title: 'Comprehensive Case Modes',
        desc: 'Convert text instantly to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case.'
      },
      {
        title: 'One-Click Copy & Export',
        desc: 'Quickly copy transformed text to clipboard or download as a .txt file.'
      }
    ],
    faqs: [
      {
        q: 'Is my text sent to any server or recorded anywhere?',
        a: 'Never. All text analysis, sorting, deduplication, and case transformations happen 100% in your browser memory.'
      },
      {
        q: 'How accurate is the word and character counter?',
        a: 'Our algorithms handle multiple languages, irregular spacing, punctuation, and Unicode characters according to standard typographical conventions.'
      },
      {
        q: 'Can I clean messy HTML tags or extra whitespace from copied text?',
        a: 'Yes, our Text Cleaner tool strips unwanted HTML tags, redundant spaces, blank lines, and normalizes punctuation with one click.'
      }
    ]
  },

  'developer-tools': {
    id: 'developer-tools',
    name: 'Developer Tools',
    slug: 'developer-tools',
    title: 'Free Online Developer Tools — JSON Formatter, Base64 & URL Tools | TrendWala Tools',
    metaDescription: 'Clean, fast developer utilities for modern engineers. Format and validate JSON, encode/decode Base64 strings and files, and parse URLs privately in your browser.',
    icon: 'code',
    badge: '5 Tools',
    h1: 'Online Developer Tools & Code Utilities',
    subtitle: 'Format JSON, validate payloads, encode Base64, and decode URLs with zero risk of leaking private API keys or payloads.',
    description: 'Engineers handle sensitive tokens, production payloads, and proprietary data daily. Public online formatting websites that send payloads to remote servers represent severe security hazards. TrendWala Developer Tools execute entirely client-side, guaranteeing that your proprietary schemas, Base64 payloads, and URLs are never seen by third parties.',
    features: [
      {
        title: 'Zero Payload Leakage',
        desc: 'Safely format proprietary JSON payloads, API responses, and authentication tokens without sending them across the wire.'
      },
      {
        title: 'Precise Error Highlighting',
        desc: 'Identify invalid JSON syntax instantly with exact line, column, and token error diagnostics.'
      },
      {
        title: 'Binary & File Base64 Support',
        desc: 'Encode and decode raw strings, images, and binary files to and from Base64 data URLs.'
      },
      {
        title: 'Deep URL Parsing',
        desc: 'Deconstruct complex URLs into protocol, domain, path, and an editable query parameter key-value table.'
      }
    ],
    faqs: [
      {
        q: 'Is it safe to format proprietary JSON data here?',
        a: 'Yes, 100%. Open your browser developer network tab and verify for yourself: not a single byte of your JSON is ever transmitted over the network.'
      },
      {
        q: 'Does the Base64 tool support non-ASCII and UTF-8 characters?',
        a: 'Yes! Our Base64 encoder and decoder properly handle UTF-8 Unicode strings as well as binary file data URLs.'
      }
    ]
  },

  'utility-tools': {
    id: 'utility-tools',
    name: 'Utility Tools',
    slug: 'utility-tools',
    title: 'Free Online Utility Tools — QR Code Generator | TrendWala Tools',
    metaDescription: 'Generate custom, high-resolution QR codes for websites, WiFi networks, vCards, emails, and plain text. Download in PNG or SVG vector format.',
    icon: 'tool',
    badge: '1 Tool',
    h1: 'Online Utilities & Smart Generators',
    subtitle: 'Generate high-resolution QR codes instantly with custom styling and zero data collection.',
    description: 'Create beautiful, scannable QR codes for your business, marketing materials, WiFi sharing, and print flyers. Customize foreground and background colors, adjust error correction levels, and download vector SVG or high-resolution PNG images directly in your browser.',
    features: [
      {
        title: 'Multiple Content Types',
        desc: 'Create QR codes for URLs, plain text, WiFi credentials, Email addresses, Phone numbers, and vCard contact cards.'
      },
      {
        title: 'Custom Color Themes',
        desc: 'Brand your QR codes with custom foreground and background colors while maintaining high scannability.'
      },
      {
        title: 'Crisp Vector SVG & PNG',
        desc: 'Download in scalable vector format (SVG) for professional printing or high-resolution PNG for digital media.'
      },
      {
        title: 'Error Correction Control',
        desc: 'Choose from 4 error correction tiers (L, M, Q, H) to ensure your QR code remains readable even if partially damaged.'
      }
    ],
    faqs: [
      {
        q: 'Do generated QR codes expire?',
        a: 'No. The QR codes generated on TrendWala Tools are static and direct. They contain the raw data itself and do not depend on any third-party redirect link, meaning they will work forever.'
      },
      {
        q: 'Can I use the generated QR codes for commercial projects?',
        a: 'Yes, all generated QR codes are 100% free for both personal and commercial use without watermarks or attribution requirements.'
      }
    ]
  }
};
