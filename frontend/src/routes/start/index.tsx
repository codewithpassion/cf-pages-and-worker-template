import { Button } from "@/components/ui/button";
import { API_ENDPOINT } from "@/data/constants";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Component = function Start(props: DashboardProps): JSX.Element {
  const { className, ...other } = props;

  const [data, setData] = useState<{ message: string } | undefined>(undefined);

  const fetchData = async () => {
    const response = await fetch(`${API_ENDPOINT}/open`);
    const json = await response.json();
    setData(json);
  };

  return (
    <>
      <div
        className={`${className ?? ""} w-full flex flex-col md:flex-row container relative mx-auto`}
        {...other}
      >
        Welcome {API_ENDPOINT}
      </div>
      <div
        className={`w-full flex flex-col container md:flex-row relative mx-auto pt-10`}
      >
        <Button onClick={() => fetchData()}>Click me</Button>
        <Link to="/dashboard">Dashboard</Link>
      </div>
      {data && (
        <div
          className={`w-full flex flex-col container md:flex-row relative mx-auto pt-10 prose`}
        >
          <h2>{data.message}</h2>
        </div>
      )}
    </>
  );
};

export type DashboardProps = React.HTMLAttributes<HTMLDivElement>;
