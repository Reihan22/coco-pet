export default function RobotPet() {
  const c = {
    body: '#3a3f5c',
    accent: '#5a6080',
    visor: '#00e5ff',
    visorGlow: '#00b8d4',
    eye: '#ff3d00',
    joint: '#2a2e45',
    light: '#76ff03',
    dark: '#1a1e30',
    plate: '#4a5070',
  };

  return (
    <svg width="180" height="180" viewBox="0 0 180 180" style={{ imageRendering: 'pixelated' }}>
      {/* --- ANTENNA --- */}
      <rect x="86" y="12" width="8" height="16" fill={c.accent} />
      <rect x="82" y="8" width="16" height="8" rx="2" fill={c.eye} />
      <circle cx="90" cy="12" r="3" fill={c.eye} opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* --- HEAD --- */}
      <rect x="50" y="28" width="80" height="52" rx="6" fill={c.body} />
      <rect x="54" y="32" width="72" height="44" rx="4" fill={c.plate} />
      {/* forehead plate */}
      <rect x="62" y="34" width="56" height="8" rx="2" fill={c.accent} />

      {/* --- VISOR / EYES --- */}
      <rect x="58" y="44" width="64" height="20" rx="4" fill={c.dark} />
      <rect x="60" y="46" width="60" height="16" rx="3" fill={c.visor} opacity="0.15" />
      {/* left eye */}
      <rect x="66" y="50" width="16" height="12" rx="2" fill={c.eye}>
        <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
      </rect>
      {/* right eye */}
      <rect x="98" y="50" width="16" height="12" rx="2" fill={c.eye}>
        <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" begin="0.3s" />
      </rect>
      {/* visor reflection */}
      <rect x="62" y="47" width="20" height="3" rx="1" fill="white" opacity="0.25" />

      {/* --- MOUTH GRILL --- */}
      <rect x="72" y="68" width="36" height="4" fill={c.dark} />
      <rect x="72" y="74" width="36" height="4" fill={c.dark} />

      {/* --- NECK --- */}
      <rect x="78" y="80" width="24" height="8" fill={c.joint} />

      {/* --- TORSO --- */}
      <rect x="42" y="88" width="96" height="52" rx="6" fill={c.body} />
      <rect x="46" y="92" width="88" height="44" rx="4" fill={c.plate} />
      {/* chest plate */}
      <rect x="62" y="96" width="56" height="24" rx="4" fill={c.accent} />
      {/* chest light */}
      <circle cx="90" cy="108" r="8" fill={c.light} opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="r" values="8;6;8" dur="1.8s" repeatCount="indefinite" />
      </circle>
      {/* chest detail lines */}
      <rect x="66" y="124" width="48" height="3" fill={c.joint} />
      <rect x="74" y="130" width="32" height="3" fill={c.joint} />

      {/* --- ARMS --- */}
      {/* left arm */}
      <rect x="22" y="92" width="16" height="40" rx="4" fill={c.body} />
      <rect x="24" y="94" width="12" height="36" rx="3" fill={c.plate} />
      <rect x="26" y="98" width="8" height="6" rx="1" fill={c.accent} />
      <rect x="22" y="132" width="16" height="8" rx="3" fill={c.joint} />
      {/* left hand */}
      <rect x="20" y="140" width="20" height="14" rx="4" fill={c.body} />
      <rect x="24" y="144" width="4" height="6" rx="1" fill={c.dark} />
      <rect x="30" y="144" width="4" height="6" rx="1" fill={c.dark} />

      {/* right arm */}
      <rect x="142" y="92" width="16" height="40" rx="4" fill={c.body} />
      <rect x="144" y="94" width="12" height="36" rx="3" fill={c.plate} />
      <rect x="146" y="98" width="8" height="6" rx="1" fill={c.accent} />
      <rect x="142" y="132" width="16" height="8" rx="3" fill={c.joint} />
      {/* right hand - fist */}
      <rect x="140" y="140" width="20" height="14" rx="4" fill={c.body} />
      <rect x="144" y="144" width="4" height="6" rx="1" fill={c.dark} />
      <rect x="150" y="144" width="4" height="6" rx="1" fill={c.dark} />

      {/* --- LEGS --- */}
      {/* left leg */}
      <rect x="54" y="140" width="24" height="8" rx="2" fill={c.joint} />
      <rect x="50" y="148" width="24" height="20" rx="4" fill={c.body} />
      <rect x="52" y="150" width="20" height="16" rx="3" fill={c.plate} />
      {/* left foot */}
      <rect x="46" y="168" width="32" height="10" rx="4" fill={c.accent} />
      <rect x="48" y="168" width="28" height="4" rx="2" fill={c.body} />

      {/* right leg */}
      <rect x="102" y="140" width="24" height="8" rx="2" fill={c.joint} />
      <rect x="106" y="148" width="24" height="20" rx="4" fill={c.body} />
      <rect x="108" y="150" width="20" height="16" rx="3" fill={c.plate} />
      {/* right foot */}
      <rect x="102" y="168" width="32" height="10" rx="4" fill={c.accent} />
      <rect x="104" y="168" width="28" height="4" rx="2" fill={c.body} />

      {/* --- SHOULDER PADS --- */}
      <rect x="36" y="86" width="22" height="12" rx="4" fill={c.accent} />
      <rect x="122" y="86" width="22" height="12" rx="4" fill={c.accent} />
      {/* shoulder bolts */}
      <circle cx="42" cy="92" r="3" fill={c.dark} />
      <circle cx="138" cy="92" r="3" fill={c.dark} />

      {/* --- GLOW EFFECTS --- */}
      <rect x="58" y="44" width="64" height="20" rx="4" fill={c.visor} opacity="0.08">
        <animate attributeName="opacity" values="0.08;0.2;0.08" dur="2s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}
