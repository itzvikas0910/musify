import useAuth from "hooks/useAuth";
import { ReactElement } from "react";
import { ITrack } from "types/spotify";
import { divideArray } from "utils/divideArray";
import { isCorruptedTrack } from "utils/isCorruptedTrack";
import CardTrack, { CardType } from "./CardTrack";
import Carousel from "./Carousel";
import FirstTrackContainer from "./FirstTrackContainer";
interface MainTracksProps {
  title: string;
  tracksRecommendations: ITrack[];
  tracksInLibrary?: boolean[] | null;
}

export default function MainTracks({
  title,
  tracksRecommendations,
  tracksInLibrary,
}: MainTracksProps): ReactElement {
  const { accessToken } = useAuth();
  const allTracks = tracksRecommendations?.map((track) => {
    return {
      ...track,
      audio: track?.preview_url,
      corruptedTrack: isCorruptedTrack(track),
    };
  });
  return (
    <Carousel title={title} gap={24}>
      {divideArray(tracksRecommendations, 5).map((tracks, i) => {
        return (
          <div className="tracks" key={i}>
            <FirstTrackContainer
              track={tracks?.[0]}
              preview={tracks?.[0]?.preview_url}
              position={i * 5}
              allTracks={allTracks}
            />
            <div>
              {tracks?.map((track, chunkIndex) => {
                if (chunkIndex === 0 || chunkIndex > 4 || !track) {
                  return null;
                }
                const index = i * 5 + chunkIndex;
                const uris = tracksRecommendations?.map(
                  (track) => track.uri || ""
                );

                return (
                  <CardTrack
                    accessToken={accessToken ?? ""}
                    isTrackInLibrary={tracksInLibrary?.[index] ?? false}
                    playlistUri=""
                    track={track}
                    key={track.id}
                    type={CardType.presentation}
                    position={index}
                    isSingleTrack
                    uris={uris}
                  />
                );
              })}
            </div>
            <style jsx>{`
              .tracks {
                display: grid;
                grid-template-columns: 49% 49%;
                width: 100%;
                grid-gap: 20px;
                margin: 10px 0 30px;
                min-width: calc(100% - 24px);
              }
              @media (max-width: 1000px) {
                .tracks {
                  grid-template-columns: 100%;
                }
              }
            `}</style>
          </div>
        );
      })}
    </Carousel>
  );
}
