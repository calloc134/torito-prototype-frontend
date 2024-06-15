import {
  useContext,
  useState,
  createContext,
  useCallback,
  Suspense,
} from "react";

import { Textarea } from "./components/ui/textarea";
// import { Button } from "./components/ui/button";
import { Checkbox } from "./components/ui/checkbox";
import { Button } from "./components/ui/button";
import { RotateLoader } from "react-spinners";
import { AuroraBackground } from "./components/ui/aurora-background";

const serverDataContext = createContext<ServerDataContextType>({
  data: {
    useBridge: false,
    useDefaultBridges: false,
    BridgeText: "dummy",
    ProxyText: "dummy",
    backUpPath: "dummy",
    others: [],
  },
  mutationData: async () => {},
});

type ServerData = {
  useBridge: boolean;
  useDefaultBridges: boolean;
  BridgeText: string;
  ProxyText: string;
  backUpPath: string;
  others: Array<string>;
};

type ServerDataContextType = {
  data: ServerData;
  mutationData: () => Promise<void>;
};

// useFetchDataで一時的にキャッシュとして利用するデータ
let dataCache: ServerData | undefined = undefined;

// promiseをthrow
const fetchData = () => {
  const fetchData = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("fetch error");
    }
    const data = (await response.json()) as ServerData;
    return data;
  };

  // promiseをthrow
  if (!dataCache) {
    throw new Promise((resolve, reject) => {
      fetchData("https://webhook.site/f47d9738-c2e9-4360-a139-dba3ba0ff18e")
        .then((data) => {
          console.debug("fetch data", data);
          dataCache = data;
          resolve(data);
        })
        .catch((error) => {
          console.error("fetch error", error);
          reject(error);
        });
    });
  }

  return dataCache;
};

const Child = () => {
  const { data } = useContext(serverDataContext);

  return (
    <div className="flex flex-row w-full h-full gap-4 p-2">
      <div className="flex flex-col w-1/2 gap-4">
        <div className="flex flex-col h-1/2 gap-2">
          <h1>Bridge</h1>
          <div className="flex flex-row gap-2  items-center">
            <Checkbox />
            <p>Use Default Bridges</p>
          </div>

          <Textarea
            value={data.BridgeText}
            onChange={(e) => {
              console.log(e.target.value);
            }}
            className="h-full opacity-80 bg-gradient-to-tr from-indigo-100 to-indigo-300 rounded-2xl text-indigo-600"
          ></Textarea>
        </div>
        <div className="flex flex-col h-1/2 gap-2">
          <h1>Proxy</h1>
          <Textarea
            value={data.ProxyText}
            onChange={(e) => {
              console.log(e.target.value);
            }}
            className="h-full opacity-80 bg-gradient-to-tr from-indigo-100 to-indigo-300 rounded-2xl text-indigo-900"
          ></Textarea>
        </div>
      </div>
      <div className="flex flex-col w-1/2 gap-2">
        <h1>Server Log</h1>
        <Textarea
          readOnly
          className="h-full opacity-80 bg-gradient-to-tr from-indigo-100 to-indigo-300 rounded-2xl text-indigo-900"
        ></Textarea>
        <Button
          onClick={() => {
            console.log("clicked");
          }}
          variant="secondary"
        >
          Save
        </Button>
      </div>
    </div>
  );
};

type result = "success" | "error";

const ServerDataPovider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState(fetchData());

  const mutationData = useCallback(async () => {
    const mutationData = async (
      url: string,
      data: ServerData
    ): Promise<result> => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        return "error";
      }

      return "success";
    };

    const resultData = await mutationData(
      "https://webhook.site/4f5f0dcb-2ae4-47d1-8f99-156bcdb40a97",
      data
    );

    if (resultData === "error") {
      throw new Error("fetch error");
    }

    setData(data);
  }, [data]);

  return (
    <serverDataContext.Provider value={{ data, mutationData }}>
      {children}
    </serverDataContext.Provider>
  );
};

const loading = (
  <div className="flex flex-col items-center justify-center gap-4 p-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
    <p className="text-2xl font-bold">Loading...</p>
    <RotateLoader color="#2563EB" loading={true} size={15} />
  </div>
);

function App() {
  return (
    <>
      <div className="flex justify-center items-center h-screen w-full dark bg-gray-900 ">
        <AuroraBackground className="flex flex-col gap-8 p-4 w-full h-full">
          <div className="flex h-screen w-screen justify-center items-center">
            <Suspense fallback={loading}>
              <ServerDataPovider>
                <Child />
              </ServerDataPovider>
            </Suspense>
          </div>
        </AuroraBackground>
      </div>
    </>
  );
}

export default App;
