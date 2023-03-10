import {
  createContext,
  Dispatch,
  ReactElement,
  PropsWithChildren,
  SetStateAction,
  useState,
  useEffect,
} from "react";

export interface IHeaderContext {
  element: ReactElement | null;
  displayOnFixed: boolean;
  setDisplayOnFixed: Dispatch<SetStateAction<boolean>>;
  alwaysDisplayColor: boolean;
  disableBackground: boolean;
  setAlwaysDisplayColor: Dispatch<SetStateAction<boolean>>;
  setElement: Dispatch<SetStateAction<ReactElement | null>>;
  headerColor: string;
  setHeaderColor: Dispatch<SetStateAction<string>>;
  disableOpacityChange: boolean;
  setDisableOpacityChange: Dispatch<SetStateAction<boolean>>;
  setDisableBackground: Dispatch<SetStateAction<boolean>>;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const HeaderContext = createContext<IHeaderContext>(null!);
export default HeaderContext;

export function HeaderContextProvider({
  children,
}: PropsWithChildren): ReactElement {
  const [displayOnFixed, setDisplayOnFixed] = useState<boolean>(false);
  const [alwaysDisplayColor, setAlwaysDisplayColor] = useState<boolean>(false);
  const [disableOpacityChange, setDisableOpacityChange] =
    useState<boolean>(false);
  const [element, setElement] = useState<ReactElement | null>(null);
  const [headerColor, setHeaderColor] = useState<string>("#7a7a7a");
  const [disableBackground, setDisableBackground] = useState<boolean>(false);

  useEffect(() => {
    if (headerColor) {
      document.body.style.setProperty("--header-color", headerColor);
    }

    return () => {
      document.body.style.removeProperty("--header-color");
    };
  }, [headerColor]);

  return (
    <HeaderContext.Provider
      value={{
        displayOnFixed,
        setDisplayOnFixed,
        element,
        setElement,
        headerColor,
        setHeaderColor,
        alwaysDisplayColor,
        setAlwaysDisplayColor,
        disableOpacityChange,
        setDisableOpacityChange,
        disableBackground,
        setDisableBackground,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
