import DataSourceProd from './dataSourceProd';
import DataSourceLocal from './dataSourceLocal';
import * as dotenv from 'dotenv';
dotenv.config();

// export default process.env.NODE_ENV === 'production'
//   ? DataSourceProd
//   : DataSourceLocal;

export default DataSourceLocal;
