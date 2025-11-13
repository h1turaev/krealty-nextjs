const HighlandLogo = () => (
  <svg width="200" height="40" viewBox="0 0 280 60" xmlns="http://www.w3.org/2000/svg">
    {/* Minimal skyscraper lines */}
    <line x1="0" y1="50" x2="0" y2="10" stroke="#000" strokeWidth="3" opacity="0.75" />
    <line x1="10" y1="50" x2="10" y2="0" stroke="#000" strokeWidth="3" />
    <line x1="20" y1="50" x2="20" y2="18" stroke="#000" strokeWidth="3" opacity="0.5" />
    <text
      x="40"
      y="32"
      fontFamily="Playfair Display, serif"
      fontSize="24"
      letterSpacing="0.18em"
      fill="#000"
      dominantBaseline="middle"
    >
      HIGHLAND
    </text>
  </svg>
);

export default HighlandLogo;
