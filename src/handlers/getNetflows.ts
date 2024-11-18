import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getNetflows } from "../utils/wrappa/postgres/query";
import { closeIdleConnections } from "../utils/wrappa/postgres/write";

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  await closeIdleConnections();
  const period = event.pathParameters?.period?.toLowerCase() as "day" | "week" | "month";

  if (!period || !["day", "week", "month"].includes(period)) {
    return errorResponse({
      message: "Period must be one of: day, week, month",
    });
  }

  const response = await getNetflows(period);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
