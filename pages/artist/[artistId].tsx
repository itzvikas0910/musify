import { CardType } from "components/CardContent";
import CardTrack, { CardType as TrackCardType } from "components/CardTrack";
import Carousel from "components/Carousel";
import ContentContainer from "components/ContentContainer";
import Heading from "components/Heading";
import PageHeader from "components/PageHeader";
import { PlayButton } from "components/PlayButton";
import PlaylistTopBarExtraField from "components/PlaylistTopBarExtraField";
import PresentationCard from "components/PresentationCard";
import SubTitle from "components/SubtTitle";
import useAnalytics from "hooks/useAnalytics";
import useAuth from "hooks/useAuth";
import useHeader from "hooks/useHeader";
import useSpotify from "hooks/useSpotify";
import useTranslations from "hooks/useTranslations";
import { NextApiRequest, NextApiResponse } from "next";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { HeaderType } from "types/pageHeader";
import { conjuction } from "utils/conjuction";
import { getSiteUrl } from "utils/environment";
import { fullFilledValue } from "utils/fullFilledValue";
import { Artist, getArtistInfo } from "utils/getArtistInfo";
import { getAuth } from "utils/getAuth";
import { getMonth } from "utils/getMonth";
import { getSetLists, SetLists } from "utils/getSetLists";
import { getTranslations, Page } from "utils/getTranslations";
import { serverRedirect } from "utils/serverRedirect";
import { checkIfUserFollowArtistUser } from "utils/spotifyCalls/checkIfUserFollowArtistUser";
import { follow, Follow_type } from "utils/spotifyCalls/follow";
import {
  getArtistAlbums,
  Include_groups,
} from "utils/spotifyCalls/getArtistAlbums";
import { getArtistById } from "utils/spotifyCalls/getArtistById";
import { getArtistTopTracks } from "utils/spotifyCalls/getArtistTopTracks";
import { getRelatedArtists } from "utils/spotifyCalls/getRelatedArtists";
import { unFollow } from "utils/spotifyCalls/unFollow";

interface ArtistPageProps {
  currentArtist: SpotifyApi.SingleArtistResponse | null;
  topTracks: SpotifyApi.MultipleTracksResponse | null;
  singleAlbums: SpotifyApi.ArtistsAlbumsResponse | null;
  appearAlbums: SpotifyApi.ArtistsAlbumsResponse | null;
  relatedArtists: SpotifyApi.ArtistsRelatedArtistsResponse | null;
  accessToken?: string;
  user: SpotifyApi.UserObjectPrivate | null;
  setLists: SetLists | null;
  artistInfo: Artist | null;
  translations: Record<string, string>;
  albums: SpotifyApi.ArtistsAlbumsResponse | null;
  compilations: SpotifyApi.ArtistsAlbumsResponse | null;
}

export default function ArtistPage({
  currentArtist,
  topTracks,
  singleAlbums,
  appearAlbums,
  relatedArtists,
  user,
  accessToken,
  setLists,
  artistInfo,
  albums,
  compilations,
}: ArtistPageProps): ReactElement {
  const { setUser, setAccessToken } = useAuth();
  const { trackWithGoogleAnalytics } = useAnalytics();
  const banner = artistInfo?.banner;
  const { setElement } = useHeader({
    alwaysDisplayColor: false,
    disableOpacityChange: !!banner,
    showOnFixed: false,
  });
  const router = useRouter();
  const { setPageDetails, setAllTracks, allTracks } = useSpotify();
  const [showMoreTopTracks, setShowMoreTopTracks] = useState(false);
  const [isFollowingThisArtist, setIsFollowingThisArtist] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
  const { translations } = useTranslations();

  useEffect(() => {
    if (!currentArtist) {
      router.push("/");
    }
    trackWithGoogleAnalytics();

    setAccessToken(accessToken);

    setUser(user);
  }, [
    accessToken,
    currentArtist,
    router,
    setAccessToken,
    setUser,
    trackWithGoogleAnalytics,
    user,
  ]);

  useEffect(() => {
    checkIfUserFollowArtistUser(
      Follow_type.artist,
      currentArtist?.id,
      accessToken
    ).then((res) => {
      setIsFollowingThisArtist(res);
    });
  }, [accessToken, currentArtist?.id, router]);

  useEffect(() => {
    setElement(() => <PlaylistTopBarExtraField uri={currentArtist?.uri} />);
    const user: SpotifyApi.UserObjectPublic = {
      display_name: currentArtist?.name,
      id: currentArtist?.id ?? "",
      images: currentArtist?.images,
      external_urls: { spotify: currentArtist?.external_urls.spotify ?? "" },
      href: "",
      uri: "",
      type: "user",
    };

    const items =
      topTracks?.tracks.map((track) => ({
        ...track,
        added_at: "",
        added_by: user,
        track: track,
        is_local: false,
      })) ?? [];

    setPageDetails({
      name: currentArtist?.name,
      uri: currentArtist?.uri,
      followers: { total: currentArtist?.followers?.total },
      description: currentArtist?.name,
      id: currentArtist?.id,
      tracks: { total: 10 },
      owner: user,
      type: "artist",
    });
    setAllTracks(
      items.map((track) => ({
        ...track,
        audio: track.preview_url,
        type: "track",
      }))
    );
  }, [
    topTracks,
    setElement,
    setPageDetails,
    router,
    setAllTracks,
    currentArtist?.name,
    currentArtist?.id,
    currentArtist?.images,
    currentArtist?.external_urls.spotify,
    currentArtist?.uri,
    currentArtist?.followers?.total,
  ]);

  const artistBiography = artistInfo?.bio?.content;

  return (
    <ContentContainer hasPageHeader>
      <PageHeader
        type={HeaderType.artist}
        title={currentArtist?.name ?? ""}
        coverImg={
          currentArtist?.images?.[0]?.url ??
          currentArtist?.images?.[1]?.url ??
          `${getSiteUrl()}/defaultSongCover.jpeg`
        }
        totalFollowers={currentArtist?.followers?.total ?? 0}
        popularity={currentArtist?.popularity ?? 0}
        banner={banner ?? ""}
        disableOpacityChange={!!banner}
        stats={artistInfo?.stats}
        data={currentArtist}
      />
      <div className="options">
        <PlayButton
          uri={currentArtist?.uri}
          size={56}
          centerSize={28}
          allTracks={allTracks}
        />
        <div className="info button-inof">
          <button
            type="button"
            className="follow-button"
            onClick={(e) => {
              e.stopPropagation();
              if (isFollowingThisArtist) {
                unFollow(
                  Follow_type.artist,
                  currentArtist?.id,
                  accessToken
                ).then((res) => {
                  if (res) {
                    setIsFollowingThisArtist(false);
                  }
                });
              } else {
                follow(Follow_type.artist, currentArtist?.id, accessToken).then(
                  (res) => {
                    if (res) {
                      setIsFollowingThisArtist(true);
                    }
                  }
                );
              }
            }}
          >
            {isFollowingThisArtist
              ? translations.following
              : translations.follow}
          </button>
        </div>
      </div>
      <div className="content">
        {topTracks?.tracks && topTracks?.tracks?.length > 0 ? (
          <Heading number={2}>{translations.popular}</Heading>
        ) : null}
        <div className="popular-content">
          <div className="topTracks">
            <div>
              {topTracks?.tracks &&
                topTracks?.tracks?.map((track, i) => {
                  const maxToShow = showMoreTopTracks ? 10 : 5;
                  if (i >= maxToShow) {
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
                      type={TrackCardType.playlist}
                    />
                  );
                })}
            </div>
            <button
              type="button"
              className="show-more"
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreTopTracks((prev) => !prev);
              }}
            >
              {showMoreTopTracks
                ? translations.showLess
                : translations.showMore}
            </button>
          </div>
          {currentArtist?.id &&
          setLists?.setlist &&
          setLists?.setlist?.length > 0 ? (
            <div className="set-list">
              <div className="set-list-content">
                <Heading number={2}>{translations.concerts}</Heading>
                {setLists?.setlist?.map((set, i) => {
                  if (i > 4) return null;
                  const date = set.eventDate.split("-");

                  const year = date[2];
                  const month = date[1];
                  const day = date[0];

                  return (
                    <Link
                      href={`/concert/${currentArtist.id}.${set.id}`}
                      key={set.id}
                      className="set"
                    >
                      <div className="set-date">
                        <span className="month">
                          {getMonth(Number(month) - 1)}
                        </span>
                        <span className="day">{day}</span>
                        <span className="year">{year}</span>
                      </div>
                      <div className="set-info">
                        <Heading number={5} as="h4">
                          {set.venue?.name}
                        </Heading>
                        <span>
                          {conjuction([
                            set.venue?.city.name,
                            set.venue?.city.state,
                            set.venue?.city.country.code,
                          ])}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        {albums && albums.items?.length > 0 ? (
          <Carousel title={translations.albumsCarouselTitle} gap={24}>
            {albums.items?.map((item) => {
              if (!item) return null;
              const { images, name, id, artists, release_date, album_type } =
                item;
              return (
                <PresentationCard
                  type={CardType.ALBUM}
                  key={id}
                  images={images}
                  title={name}
                  subTitle={
                    <SubTitle
                      artists={artists}
                      albumType={album_type}
                      releaseYear={release_date}
                    />
                  }
                  id={id}
                />
              );
            })}
          </Carousel>
        ) : null}
        {singleAlbums && singleAlbums.items?.length > 0 ? (
          <Carousel title={translations.singleAlbumsCarouselTitle} gap={24}>
            {singleAlbums.items?.map((item) => {
              if (!item) return null;
              const { images, name, id, artists, release_date, album_type } =
                item;
              return (
                <PresentationCard
                  type={CardType.ALBUM}
                  key={id}
                  images={images}
                  title={name}
                  subTitle={
                    <SubTitle
                      artists={artists}
                      albumType={album_type}
                      releaseYear={release_date}
                    />
                  }
                  id={id}
                />
              );
            })}
          </Carousel>
        ) : null}
        {appearAlbums && appearAlbums.items?.length > 0 ? (
          <Carousel title={translations.appearAlbumsCarouselTitle} gap={24}>
            {appearAlbums.items?.map(
              ({ images, name, id, artists, release_date, album_type }) => {
                return (
                  <PresentationCard
                    type={CardType.ALBUM}
                    key={id}
                    images={images}
                    title={name}
                    subTitle={
                      <SubTitle
                        artists={artists}
                        albumType={album_type}
                        releaseYear={release_date}
                      />
                    }
                    id={id}
                  />
                );
              }
            )}
          </Carousel>
        ) : null}
        {compilations && compilations.items?.length > 0 ? (
          <Carousel title={translations.compilationsCarouselTitle} gap={24}>
            {compilations.items?.map(
              ({ images, name, id, artists, release_date, album_type }) => {
                return (
                  <PresentationCard
                    type={CardType.ALBUM}
                    key={id}
                    images={images}
                    title={name}
                    subTitle={
                      <SubTitle
                        artists={artists}
                        albumType={album_type}
                        releaseYear={release_date}
                      />
                    }
                    id={id}
                  />
                );
              }
            )}
          </Carousel>
        ) : null}
        {relatedArtists && relatedArtists.artists?.length > 0 ? (
          <Carousel title={translations.relatedArtistsCarouselTitle} gap={24}>
            {relatedArtists.artists?.map((item) => {
              if (!item) return null;
              const { images, name, id } = item;
              return (
                <PresentationCard
                  type={CardType.ARTIST}
                  key={id}
                  images={images}
                  title={name}
                  subTitle={translations.artist}
                  id={id}
                />
              );
            })}
          </Carousel>
        ) : null}
        {artistBiography && (
          <section className="about">
            <div>
              <Heading number={3} as="h2">
                {translations.about}
              </Heading>
              {showMoreAbout ? (
                <p
                  dangerouslySetInnerHTML={{ __html: artistInfo?.bio?.content }}
                ></p>
              ) : (
                <p
                  dangerouslySetInnerHTML={{ __html: artistInfo?.bio?.summary }}
                ></p>
              )}
              <button
                type="button"
                className="read-more"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreAbout((prev) => !prev);
                }}
              >
                {showMoreAbout ? translations.readLess : translations.readMore}
              </button>
            </div>
            <div className="artist-about-img-container">
              {artistInfo?.thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="artist-about-img"
                  src={artistInfo?.thumb}
                  alt={currentArtist?.name}
                />
              )}
            </div>
          </section>
        )}
        {setLists ? (
          <div className="attribution">
            <p>
              {translations.concertSetlistOn}{" "}
              <a
                href="https://www.setlist.fm/"
                target="_blank"
                rel="noreferrer noopener"
              >
                setlist.fm
              </a>
            </p>
          </div>
        ) : null}
      </div>
      <style jsx>{`
        .attribution {
          margin-top: 16px;
          padding-bottom: 24px;
        }
        .attribution p {
          font-size: 0.6875rem;
          line-height: 1rem;
          text-transform: none;
          letter-spacing: normal;
          font-weight: 400;
          color: #ffffffb3;
          margin: 0;
        }
        .set-info span,
        .attribution a,
        .about :global(a) {
          color: #ffffffb3;
        }
        .set-list-content :global(a) {
          display: flex;
          padding: 8px;
          cursor: pointer;
          width: 100%;
          text-decoration: none;
        }
        .set-list-content :global(a:hover) {
          border-radius: 3px;
          background: #c6ccd317;
        }
        .set-info {
          margin-left: 18px;
          display: flex;
          flex-direction: column;
        }
        .set-info span {
          margin: 0;
          font-size: 14px;
        }
        .set-list {
          margin-left: 20px;
          flex: 40%;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 999999;
        }
        .set-list-content :global(h2) {
          margin-left: 8px;
        }
        .month {
          text-align: left;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 12px;
        }
        .day {
          font-weight: normal;
          color: inherit;
          text-transform: none;
          text-align: left;
          font-size: 24px;
        }
        .year {
          font-weight: normal;
          color: inherit;
          text-transform: none;
          text-align: left;
          font-size: 12px;
        }
        .set-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
          font-size: 16px;
          width: fit-content;
          color: #ffffff;
        }
        .content .read-more {
          margin-top: 16px;
          padding: 0;
        }
        .popular-content {
          display: ${setLists ? "flex" : "block"};
        }
        .about {
          display: grid;
          grid-template-columns: minmax(180px, 700px) minmax(180px, 1fr);
        }
        .artist-about-img-container {
          display: flex;
          justify-content: center;
        }
        .artist-about-img {
          width: 100%;
          margin-top: 50px;
          max-width: 400px;
          height: fit-content;
          border-radius: 10px;
          max-height: 400px;
          aspect-ratio: 1;
        }
        p {
          font-size: 1rem;
          line-height: 1.5rem;
          text-transform: none;
          letter-spacing: normal;
          box-sizing: border-box;
          font-family: "Lato", sans-serif;
          margin: 0px;
          font-weight: 400;
          color: #9e9e9e;
          max-width: 672px;
          padding-top: 16px;
          padding-right: 20px;
        }
        button {
          background: none;
          border: none;
        }
        button.read-more,
        button.show-more {
          color: rgba(255, 255, 255, 0.7);
          padding: 18px;
          font-weight: bold;
        }
        button.show-more:hover,
        button:hover {
          color: white;
        }
        div.info {
          align-self: flex-end;
          width: calc(100% - 310px);
        }
        .info.button-inof {
          align-self: center;
        }
        .info button {
          margin-left: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 56px;
          height: 56px;
          min-width: 56px;
          min-height: 56px;
          background-color: transparent;
          border: none;
          min-height: 20px;
          max-height: min-content;
        }
        .info .follow-button {
          height: min-content;
        }
        .info button:focus,
        .info button:hover {
          border-color: #fff;
        }
        .info button:active {
          border-color: #fff;
        }
        .options {
          display: flex;
          padding: 24px 0;
          position: relative;
          width: 100%;
          align-items: center;
          margin: 16px 0;
          flex-direction: row;
          z-index: 999999;
          position: relative;
        }
        .options,
        .trc {
          padding: 0 32px;
        }
        .info button {
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          box-sizing: border-box;
          color: #fff;
          font-size: 16px;
          width: auto;
          font-weight: 700;
          letter-spacing: 0.1em;
          line-height: 16px;
          padding: 7px 15px;
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
          margin-right: 24px;
        }
        .content {
          padding: 32px;
          padding-bottom: 30px;
          position: relative;
          background-color: ${banner ? "#121212" : "transparent"};
        }
        .topTracks {
          display: flex;
          flex-wrap: wrap;
          margin-top: 32px;
          z-index: ${banner ? "999999" : "0"};
          position: relative;
          flex: 60%;
          height: fit-content;
        }
        @media (max-width: 768px) {
          .options {
            padding: 32px 32px;
          }
        }
        @media (max-width: 500px) {
          .popular-content,
          .about {
            display: block;
          }
        }
      `}</style>
    </ContentContainer>
  );
}

export async function getServerSideProps({
  params: { artistId },
  req,
  res,
  query,
}: {
  params: { artistId: string };
  req: NextApiRequest;
  res: NextApiResponse;
  query: NextParsedUrlQuery;
}): Promise<{
  props: ArtistPageProps | null;
}> {
  const country = (query.country || "US") as string;
  const translations = getTranslations(country, Page.Artist);
  const cookies = req?.headers?.cookie;
  if (!cookies) {
    serverRedirect(res, "/");
    return { props: null };
  }
  const { accessToken, user } = (await getAuth(res, cookies)) || {};

  const currentArtist = await getArtistById(artistId, accessToken, cookies);
  const setListAPIKey = process.env.SETLIST_FM_API_KEY;
  const lastFMAPIKey = process.env.LAST_FM_API_KEY;
  const setListsProm = getSetLists(currentArtist?.name, setListAPIKey);
  const artistInfoProm = getArtistInfo(currentArtist?.name, lastFMAPIKey);
  const topTracksProm = getArtistTopTracks(
    artistId,
    user?.country ?? "US",
    accessToken,
    cookies
  );
  const singleAlbumsProm = getArtistAlbums(
    artistId,
    user?.country ?? "US",
    Include_groups.single,
    accessToken,
    cookies
  );
  const appearAlbumsProm = getArtistAlbums(
    artistId,
    user?.country ?? "US",
    Include_groups.appears_on,
    accessToken,
    cookies
  );
  const albumsProm = getArtistAlbums(
    artistId,
    user?.country ?? "US",
    Include_groups.album,
    accessToken,
    cookies
  );
  const compilationsProm = getArtistAlbums(
    artistId,
    user?.country ?? "US",
    Include_groups.compilation,
    accessToken,
    cookies
  );

  const relatedArtistsProm = getRelatedArtists(artistId, accessToken, cookies);

  const [
    setLists,
    artistInfo,
    topTracks,
    singleAlbums,
    appearAlbums,
    relatedArtists,
    albums,
    compilations,
  ] = await Promise.allSettled([
    setListsProm,
    artistInfoProm,
    topTracksProm,
    singleAlbumsProm,
    appearAlbumsProm,
    relatedArtistsProm,
    albumsProm,
    compilationsProm,
  ]);

  return {
    props: {
      currentArtist,
      singleAlbums: fullFilledValue(singleAlbums),
      appearAlbums: fullFilledValue(appearAlbums),
      topTracks: fullFilledValue(topTracks),
      relatedArtists: fullFilledValue(relatedArtists),
      accessToken,
      user: user ?? null,
      setLists: fullFilledValue(setLists),
      artistInfo: fullFilledValue(artistInfo),
      albums: fullFilledValue(albums),
      compilations: fullFilledValue(compilations),
      translations,
    },
  };
}
