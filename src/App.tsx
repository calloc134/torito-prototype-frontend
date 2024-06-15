import {
  useContext,
  useState,
  createContext,
  useCallback,
  Suspense,
} from "react";

import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";

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
      fetchData("https://webhook.site/4f5f0dcb-2ae4-47d1-8f99-156bcdb40a97")
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
    <div className="flex w-full h-screen p-4">
      <div className="flex flex-row w-full h-full gap-4">
        <div className="flex flex-col w-1/2">
          <div className="flex flex-col h-1/2 gap-2">
            <h1>Bridge</h1>
            <Textarea
              value={data.BridgeText}
              onChange={(e) => {
                console.log(e.target.value);
              }}
              className="h-full"
            ></Textarea>
          </div>
          <div className="flex flex-col h-1/2 gap-2">
            <h1>Proxy</h1>
            <Textarea
              value={data.ProxyText}
              onChange={(e) => {
                console.log(e.target.value);
              }}
              className="h-full"
            ></Textarea>
          </div>
        </div>
        <div className="flex flex-col w-1/2 gap-2">
          <h1>Server Log</h1>
          <Textarea className="h-full" readOnly></Textarea>
          <Button
            onClick={() => {
              console.log("click");
            }}
          >
            Save
          </Button>
        </div>
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
  <div className="flex justify-center items-center h-screen">
    <h1>Loading...</h1>
  </div>
);

function App() {
  return (
    <>
      <Suspense fallback={loading}>
        <ServerDataPovider>
          <Child />
        </ServerDataPovider>
      </Suspense>
    </>
  );
}

export default App;
