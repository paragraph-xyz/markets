/**
 *
 * This is the SVG of the Paragraph logo, but in icon form.
 *
 */
export default function ParagraphIcon({
  className = "",
  size = 30,
  color = "currentColor",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 81 82"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 0V76.1345H81"
        stroke={color}
        strokeWidth="10.6585"
        strokeMiterlimit="10"
      />
      <path
        d="M34.4067 5.30176L6 76.1337L76.0722 46.9673"
        stroke={color}
        strokeWidth="10.6585"
        strokeLinejoin="round"
      />
      <path
        d="M6 76.129L59.0302 21.5845"
        stroke={color}
        strokeWidth="10.6585"
        strokeMiterlimit="10"
      />
    </svg>
  );
}
