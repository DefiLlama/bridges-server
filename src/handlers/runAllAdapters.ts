import {wrapScheduledLambda} from "../utils/wrap";
import { runAllAdaptersToCurrentBlock } from "../utils/adapter";

export default wrapScheduledLambda(async (_event) => {
  await runAllAdaptersToCurrentBlock(true, "ignore");
});
