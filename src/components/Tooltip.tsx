import Tippy, { TippyProps, useSingleton } from "@tippyjs/react";
import "tippy.js/dist/tippy.css"; // optional
import { createContext, useContext } from "react";

const TooltipSingletonContext = createContext<
  ReturnType<typeof useSingleton>[0] | undefined
>(undefined);

export const TooltipSingletonProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [source, target] = useSingleton();

  return (
    <>
      <Tippy singleton={source} />
      <TooltipSingletonContext.Provider value={target}>
        {children}
      </TooltipSingletonContext.Provider>
    </>
  );
};

export type TooltipProps = TippyProps;
export const AppTooltip = (props: TooltipProps) => {
  // NOTE: for some reason, this doesn't do 'interactive' tooltips.
  // Use normal Tippy for tooltips that must be 'interactive'.
  const target = useContext(TooltipSingletonContext);
  return <Tippy singleton={target} {...props} />;
};
