import { LoadingIcon } from "../icons";

const LoadingTable = () => {
  return (
    <div className="h-[65svh] w-full bg-gray-300 justify-items-center content-center">
      <LoadingIcon className="size-10 animate-spin" />
    </div>
  );
};

export default LoadingTable;
