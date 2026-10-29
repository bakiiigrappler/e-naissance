import { useId } from "react";

/**
 * Sceau (cachet à l'encre) de la République Gabonaise, version stylisée et monochrome.
 * Armoiries simplifiées : okoumé, écu aux trois besants et navire sur les flots, ruban « UNITI PROGREDIEMUR ».
 * Pour la production, remplacer le dessin central par le fichier vectoriel officiel fourni par l'administration.
 */
export default function SceauRepublique({ size = 96, top = "RÉPUBLIQUE GABONAISE", bottom = "ÉTAT CIVIL · LIBREVILLE", color = "#24398c", rotate = -12 }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className="sceau-rep" width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      {/* Rotation dans le SVG (et non en CSS) : rendu fidèle avec html2canvas */}
      <g transform={`rotate(${rotate} 100 100)`}>
      <defs>
        <path id={`t${id}`} d="M 24,100 A 76,76 0 0,1 176,100" />
        <path id={`b${id}`} d="M 17,100 A 83,83 0 0,0 183,100" />
      </defs>
      <g fill="none" stroke={color} opacity="0.88">
        <circle cx="100" cy="100" r="96" strokeWidth="3.5" />
        <circle cx="100" cy="100" r="90" strokeWidth="1" />
        <circle cx="100" cy="100" r="64" strokeWidth="1.6" />
      </g>
      <g fill={color} opacity="0.9" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">
        <text fontSize="15" letterSpacing="2.2"><textPath href={`#t${id}`} startOffset="50%" textAnchor="middle">{top}</textPath></text>
        <text fontSize="11.5" letterSpacing="1.6"><textPath href={`#b${id}`} startOffset="50%" textAnchor="middle">{bottom}</textPath></text>
        <text x="21" y="105" fontSize="12">★</text>
        <text x="168" y="105" fontSize="12">★</text>
      </g>
      {/* Armoiries stylisées */}
      <g stroke={color} fill="none" strokeWidth="1.8" opacity="0.9">
        {/* Okoumé */}
        <line x1="100" y1="52" x2="100" y2="66" strokeWidth="3" />
        <ellipse cx="100" cy="47" rx="17" ry="8" fill={color} fillOpacity="0.85" />
        <ellipse cx="88" cy="51" rx="7" ry="4" fill={color} fillOpacity="0.85" />
        <ellipse cx="112" cy="51" rx="7" ry="4" fill={color} fillOpacity="0.85" />
        {/* Écu */}
        <path d="M 76,67 H 124 V 96 Q 124 118 100 128 Q 76 118 76 96 Z" strokeWidth="2.2" />
        <line x1="76" y1="81" x2="124" y2="81" />
        <circle cx="88" cy="74" r="3.6" fill={color} />
        <circle cx="100" cy="74" r="3.6" fill={color} />
        <circle cx="112" cy="74" r="3.6" fill={color} />
        {/* Navire */}
        <path d="M 86,104 H 114 L 109,111 H 91 Z" fill={color} fillOpacity="0.85" />
        <line x1="100" y1="86" x2="100" y2="104" />
        <path d="M 101,88 L 111,102 H 101 Z" fill={color} fillOpacity="0.6" />
        <path d="M 84,116 q 4,-3 8,0 t 8,0 t 8,0 t 8,0" strokeWidth="1.4" />
        {/* Panthères (supports), stylisées */}
        <path d="M 72,78 q -10,6 -8,20 q 2,10 8,14" strokeWidth="2.4" />
        <path d="M 128,78 q 10,6 8,20 q -2,10 -8,14" strokeWidth="2.4" />
      </g>
      <g fill={color} opacity="0.9" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" textAnchor="middle">
        <path d="M 70,134 Q 100,142 130,134 L 128,142 Q 100,150 72,142 Z" fill="none" stroke={color} strokeWidth="1.2" />
        <text x="100" y="143" fontSize="6.4" letterSpacing="0.6">UNITI PROGREDIEMUR</text>
        <text x="100" y="156" fontSize="7" letterSpacing="0.8">UNION · TRAVAIL · JUSTICE</text>
      </g>
      </g>
    </svg>
  );
}
