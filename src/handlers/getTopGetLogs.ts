import { IResponse, successResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getAllGetLogsCounts } from "../utils/cache";

const getTopGetLogs = async () => {
  const counts = await getAllGetLogsCounts();
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([key, count]) => ({ key, count }));
  return sorted;
};

const handler = async (): Promise<IResponse> => {
  const response = await getTopGetLogs();
  return successResponse(response, 60);
};

export default wrap(handler);
