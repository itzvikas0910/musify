import { ACCESS_TOKEN_COOKIE } from "utils/constants";
import { takeCookie } from "utils/cookies";

export async function unFollowAlbums(
  ids?: string[],
  accessToken?: string
): Promise<boolean | null> {
  if (!ids) {
    return null;
  }
  const res = await fetch(
    `https://api.spotify.com/v1/me/albums?ids=${ids.join()}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          accessToken ? accessToken : takeCookie(ACCESS_TOKEN_COOKIE) || ""
        }`,
      },
    }
  );
  return res.ok;
}
