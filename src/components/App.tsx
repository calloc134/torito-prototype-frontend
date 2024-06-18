import { Suspense } from "react";
import { AuroraBackground } from "./ui/aurora-background";
import { ServerDataProvider } from "@/context/ServerDataProvider";
import { Loading } from "./Loading";
import { Toaster } from "react-hot-toast";
import { MainPanel } from "./MainPanel";

export const App = () => {
  return (
    <>
      <div className="flex justify-center items-center h-screen w-full dark bg-gray-900 ">
        <AuroraBackground className="flex flex-col gap-8 w-full h-full">
          <div className="flex h-screen w-screen justify-center items-center">
            <Suspense fallback={Loading}>
              <ServerDataProvider>
                <MainPanel />
              </ServerDataProvider>
            </Suspense>
          </div>
        </AuroraBackground>
        <Toaster />
      </div>
    </>
  );
};
