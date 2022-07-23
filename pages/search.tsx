import Head from "next/head";
import useHeader from "hooks/useHeader";
import { useEffect, ReactElement, useState } from "react";
import { NextApiRequest, NextApiResponse } from "next";
import Link from "next/link";
import useAuth from "hooks/useAuth";
import PresentationCard from "components/PresentationCard";
import { decode } from "html-entities";
import { getAuth } from "utils/getAuth";
import { getCategories } from "utils/spotifyCalls/getCategories";
import { serverRedirect } from "utils/serverRedirect";
import FirstTrackContainer from "components/FirstTrackContainer";
import { getYear } from "utils/getYear";
import Carousel from "components/Carousel";
import { SearchInputElement } from "components/SearchInputElement";
import useSpotify from "hooks/useSpotify";
import CardTrack from "components/CardTrack";
import { colors } from "utils/colors";
import { CardType } from "components/CardContent";
import ContentContainer from "components/ContentContainer";
import Heading from "components/Heading";

interface SearchPageProps {
  categories: SpotifyApi.PagingObject<SpotifyApi.CategoryObject> | null;
  accessToken: string | null;
  user: SpotifyApi.UserObjectPrivate | null;
}

export default function SearchPage({
  categories,
  accessToken,
  user,
}: SearchPageProps): ReactElement {
  const { setElement, setHeaderColor } = useHeader({ showOnFixed: true });
  const { setUser, setAccessToken } = useAuth();
  const [data, setData] = useState<SpotifyApi.SearchResponse | null>(null);
  const { isPlaying } = useSpotify();

  useEffect(() => {
    setElement(() => <SearchInputElement source="search" setData={setData} />);

    setHeaderColor("#242424");

    return () => {
      setElement(null);
    };
  }, [setElement, setHeaderColor]);

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
    setUser(user);
  }, [user, accessToken, setUser, setAccessToken]);

  return (
    <ContentContainer>
      {!isPlaying && (
        <Head>
          <title>Rindu - Search</title>
        </Head>
      )}
      {data ? (
        <div>
          {data?.tracks?.items && data.tracks?.items?.length > 0 ? (
            <>
              <Heading number={3} as="h2">
                Canciones
              </Heading>
              <section className="tracks">
                <FirstTrackContainer
                  track={data.tracks.items[0]}
                  preview={data.tracks.items[0].preview_url}
                  backgroundColor={"#7a7a7a"}
                />

                <div className="trackSearch">
                  {data.tracks?.items?.map((track, i) => {
                    if (i === 0 || i > 4) {
                      return null;
                    }
                    return (
                      <CardTrack
                        accessToken={accessToken ?? ""}
                        isTrackInLibrary={false}
                        playlistUri=""
                        track={track}
                        key={track.id}
                        isSingleTrack
                        position={i}
                        type="presentation"
                      />
                    );
                  })}
                </div>
              </section>
              <Carousel gap={24}>
                {data.tracks?.items.slice(5)?.map((track) => {
                  return (
                    <PresentationCard
                      type={CardType.TRACK}
                      key={track.id}
                      track={track}
                      images={track.album.images}
                      title={track.name}
                      subTitle={track.artists[0].name}
                      id={track.id}
                      isSingle
                    />
                  );
                })}
              </Carousel>
            </>
          ) : null}
          {data.playlists?.items && data.playlists?.items?.length > 0 ? (
            <Carousel title={"Playlists"} gap={24}>
              {data.playlists?.items?.map(
                ({ images, name, description, id, owner }, i) => {
                  if (i > 4) {
                    return;
                  }
                  return (
                    <PresentationCard
                      type={CardType.PLAYLIST}
                      key={id}
                      images={images}
                      title={name}
                      subTitle={
                        decode(description) || `De ${owner.display_name}`
                      }
                      id={id}
                    />
                  );
                }
              )}
            </Carousel>
          ) : null}
          {data.artists?.items && data.artists?.items?.length > 0 ? (
            <Carousel title={"Artists"} gap={24}>
              {data.artists?.items?.map(({ images, name, id }) => {
                return (
                  <PresentationCard
                    type={CardType.ARTIST}
                    key={id}
                    images={images}
                    title={name}
                    subTitle={"Artist"}
                    id={id}
                  />
                );
              })}
            </Carousel>
          ) : null}
          {data.albums?.items && data.albums?.items?.length > 0 ? (
            <Carousel title={"Albums"} gap={24}>
              {data.albums?.items?.map(
                ({ images, name, id, artists, release_date }) => {
                  const artistNames = artists.map((artist) => artist.name);
                  const subTitle = release_date
                    ? `${getYear(release_date)} · Album`
                    : artistNames.join(", ");
                  return (
                    <PresentationCard
                      type={CardType.ALBUM}
                      key={id}
                      images={images}
                      title={name}
                      subTitle={subTitle}
                      id={id}
                    />
                  );
                }
              )}
            </Carousel>
          ) : null}
          {data.shows?.items && data.shows?.items?.length > 0 ? (
            <Carousel title={"Shows"} gap={24}>
              {data.shows?.items?.map(({ images, name, id, publisher }) => {
                return (
                  <PresentationCard
                    type={CardType.SHOW}
                    key={id}
                    images={images}
                    title={name}
                    subTitle={publisher}
                    id={id}
                  />
                );
              })}
            </Carousel>
          ) : null}
          {data.episodes?.items && data.episodes?.items?.length > 0 ? (
            <Carousel title={"Episodes"} gap={24}>
              {(
                data.episodes as SpotifyApi.PagingObject<SpotifyApi.EpisodeObject>
              )?.items?.map(({ images, name, id, description }) => {
                return (
                  <PresentationCard
                    type={CardType.EPISODE}
                    key={id}
                    images={images}
                    title={name}
                    subTitle={description}
                    id={id}
                    isSingle
                  />
                );
              })}
            </Carousel>
          ) : null}
        </div>
      ) : (
        <>
          <Heading number={3} as="h1">
            Browse All
          </Heading>
          <div className="browse">
            {categories?.items.map(({ name, id, icons }, i) => {
              return (
                <Link key={id} href={`/genre/${id}`}>
                  <a style={{ backgroundColor: colors[i] }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={icons[0].url} alt={name} />
                    <Heading number={3} as="h2">
                      {name}
                    </Heading>
                  </a>
                </Link>
              );
            })}
          </div>
        </>
      )}
      <style jsx>{`
        .playlists {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          grid-gap: 24px;
          margin: 20px 0 50px 0;
          justify-content: space-between;
        }
        .tracks {
          display: grid;
          grid-template-columns: 49% 49%;
          width: 100%;
          grid-gap: 20px;
          margin: 10px 0 30px;
        }
        .trackItem {
          display: grid;
          border: 1px solid transparent;
          border-radius: 4px;
          height: 56px;
          position: relative;
          grid-gap: 16px;
          padding: 0 16px;
          grid-template-columns: [first] 4fr [last] minmax(120px, 1fr);
        }
        .browse {
          grid-gap: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          grid-template-rows: 1fr;
          margin-top: 20px;
        }
        .browse a {
          border: none;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          width: 100%;
          color: #fff;
        }
        .browse a::after {
          content: "";
          display: block;
          padding-bottom: 100%;
        }
        .browse :global(h2) {
          padding: 16px;
          position: absolute;
        }
        .browse img {
          transform: rotate(25deg) translate(18%, -2%);
          bottom: 0;
          right: 0;
          box-shadow: 0 2px 4px 0 rgb(0 0 0 / 20%);
          height: 100px;
          position: absolute;
          width: 100px;
          object-fit: cover;
          object-position: center center;
        }
      `}</style>
    </ContentContainer>
  );
}

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}): Promise<{
  props: SearchPageProps | null;
}> {
  const cookies = req?.headers?.cookie;
  if (!cookies) {
    serverRedirect(res, "/");
    return { props: null };
  }
  const { accessToken, user } = (await getAuth(res, cookies)) || {};
  const categories = await getCategories(
    user?.country ?? "US",
    50,
    accessToken,
    cookies
  );

  return {
    props: {
      categories,
      accessToken: accessToken ?? null,
      user: user ?? null,
    },
  };
}
