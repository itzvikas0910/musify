import useFullScreenControl from "hooks/useFullScreenControl";
import useSpotify from "hooks/useSpotify";
import { ReactElement, SVGProps } from "react";
import { DisplayInFullScreen } from "types/spotify";

type Props = {
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  displayInFullScreen: DisplayInFullScreen;
};

export default function FullScreenControl({
  icon,
  displayInFullScreen,
}: Props): ReactElement {
  const { setDisplayInFullScreen } = useFullScreenControl(displayInFullScreen);
  const isVisible = useSpotify().displayInFullScreen === displayInFullScreen;

  return (
    <>
      <button
        type="button"
        className="button full-screen-control"
        aria-label={isVisible ? "Hide" : "Show"}
        onClick={(e) => {
          e.stopPropagation();
          setDisplayInFullScreen(!isVisible);
        }}
      >
        {icon({ fill: isVisible ? "#1db954" : "#ffffffb3" })}
      </button>
      <style jsx>{`
        .full-screen-control:hover :global(svg path) {
          fill: #fff;
        }
        button {
          display: flex;
          justify-content: center;
          align-items: center;
          border: none;
          background-color: transparent;
          position: relative;
          width: 32px;
          height: 32px;
        }
      `}</style>
    </>
  );
}
