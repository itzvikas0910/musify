/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import useAuth from "hooks/useAuth";
import Link from "next/link";
import { ReactElement } from "react";

interface LogoProps {
  color: string;
}

export default function Logo({ color }: LogoProps): ReactElement {
  const { isLogin } = useAuth();
  return (
    <>
      <Link href={isLogin ? "/dashboard" : "/"}>
        <a
          translate="no"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Rindu
        </a>
      </Link>
      <style jsx>{`
        a {
          font-size: 36px;
          font-family: "Lato";
          width: 148px;
          color: ${color};
          margin: 0;
          text-decoration: none;
        }
        @media screen and (min-width: 0px) and (max-width: 780px) {
          a {
            width: 124px;
          }
        }
      `}</style>
    </>
  );
}
