import { aggregateData, runAggregateDataAllAdapters, runAggregateDataHistorical } from "./aggregate";

//aggregateData(1663762030, 'b6e8234f-4f4c-472d-8e21-aec331b28308', 10000)

// runAggregateDataAllAdapters(1680220800)

runAggregateDataHistorical(1661990400, 1681257600, 11, false);
// runAggregateDataHistorical(1680220800 - 68400, 1680220800, 12, false);
