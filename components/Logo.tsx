
"use client";

import Image from "next/image";
import React from "react";

type LogoVariant = "auto" | "light" | "dark"; 

type LogoProps = {
  className?: string;
  title?: string;
  variant?: LogoVariant;
  size? : number
};

export function Logo({ className = "h-6", title = "KoloSquad", variant = "auto", size = 120 }: LogoProps) {
  if (variant === "light") {
    return (
      <span className="inline-flex items-center" title={title} aria-label={title}>
        <Image src="/vector/default-monochrome-black.svg" width={size} height={size} alt={title} className={`block  ${className}`} />
      </span>
    );
  }

  if (variant === "dark") {
    return (
      <span className="inline-flex items-center" title={title} aria-label={title}>
        <Image src="/vector/default-monochrome-white.svg" width={size} height={size} alt={title} className={`block ${className}`} />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center" title={title} aria-label={title} suppressHydrationWarning>
      <Image src="/vector/default-monochrome-black.svg" width={size} height={size} alt={title} className={`logo--light  ${className}`} aria-hidden="true" />
      <Image src="/vector/default-monochrome-white.svg" width={size} height={size} alt={title} className={`logo--dark ${className}`} aria-hidden="true" />
    </span>
  );
}













// "use client";

// import Image from "next/image";
// import React from "react";

// type LogoVariant = "auto" | "light" | "dark"; // auto: theme-aware via CSS, light: black always, dark: white always

// type LogoProps = {
//   className?: string;
//   title?: string;
//   variant?: LogoVariant;
//   size?: number; // optional, default width/height
// };

// export function Logo({
//   className = "",
//   title = "KoloSquad",
//   variant = "auto",
//   size = 120, // default size in px
// }: LogoProps) {
//   const commonProps = {
//     alt: title,
//     width: size,
//     height: size,
//     className: `block h-auto w-auto ${className}`,
//     priority: true,
//   };

//   if (variant === "light") {
//     return (
//       <span className="inline-flex items-center" title={title} aria-label={title}>
//         <Image src="/vector/default-monochrome-black.svg" {...commonProps} />
//       </span>
//     );
//   }

//   if (variant === "dark") {
//     return (
//       <span className="inline-flex items-center" title={title} aria-label={title}>
//         <Image src="/vector/default-monochrome-white.svg" {...commonProps} />
//       </span>
//     );
//   }

//   // auto: theme-aware
//   return (
//     <span
//       className="inline-flex items-center relative"
//       title={title}
//       aria-label={title}
//       suppressHydrationWarning
//     >
//       <Image
//         src="/vector/default-monochrome-black.svg"
//         {...commonProps}
//         className={`logo--light ${commonProps.className}`}
//         aria-hidden="true"
//       />
//       <Image
//         src="/vector/default-monochrome-white.svg"
//         {...commonProps}
//         className={`logo--dark absolute inset-0 ${commonProps.className}`}
//         aria-hidden="true"
//       />
//     </span>
//   );
// }