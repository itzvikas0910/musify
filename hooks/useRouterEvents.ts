import { useRouter } from "next/router";
import { MutableRefObject, useEffect } from "react";
import { DisplayInFullScreen } from "types/spotify";
import useSpotify from "./useSpotify";

export default function useRouterEvents(
  onAppScroll: () => void,
  appRef?: MutableRefObject<HTMLDivElement | undefined>
): void {
  const router = useRouter();
  const { setDisplayInFullScreen } = useSpotify();

  useEffect(() => {
    const app = appRef?.current;

    router.events.on("routeChangeComplete", () => {
      app?.scrollTo(0, 0);
      setDisplayInFullScreen(DisplayInFullScreen.App);
    });

    app?.addEventListener("scroll", onAppScroll);

    return () => {
      router.events.off("routeChangeComplete", () => {
        app?.scrollTo(0, 0);
        setDisplayInFullScreen(DisplayInFullScreen.App);
      });
      app?.removeEventListener("scroll", onAppScroll);
    };
  }, [router, appRef, onAppScroll, setDisplayInFullScreen]);
}
