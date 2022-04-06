import { join } from 'path';
import { existsSync } from 'fs';
import * as mergeYaml from 'merge-yaml';

const ACTIVATE_ENV_LIST_FILENAME = 'config/activate-env-config.json';
const YAML_BASE_CONFIG_FILENAME = 'config/setting.yaml';
const YAML_ENV_CONFIG_FILENAME = `config/setting.${process.env.NODE_ENV || 'development'}.yaml`;

// https://stackoverflow.com/questions/63462577/how-to-load-multiple-yaml-files-at-once-in-javascript
export default () => {
  const files = [YAML_BASE_CONFIG_FILENAME, YAML_ENV_CONFIG_FILENAME]
    .map((file) => join(__dirname, file))
    .filter((file) => existsSync(file));

  try {
    const cfg = mergeYaml(files) as Record<string, any>;

    // override config by environment
    if (existsSync(join(__dirname, ACTIVATE_ENV_LIST_FILENAME))) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const envs = require(join(__dirname, ACTIVATE_ENV_LIST_FILENAME));
      for (const env of envs) {
        if (process.env[env[0]]) {
          const attrib = env[1].split('.');
          const cfgPth = _ensureConfigPath(cfg, env[1]);
          const cfgAtr = attrib[attrib.length - 1];

          cfgPth[cfgAtr] = process.env[env[0]];
        }
      }
    }

    return cfg;
  } catch (err) {
    console.log('--- merge configuration files err ---');
    console.error(err);
  }
};

function _ensureConfigPath(cfg: Record<string, any>, dotConfigPath: string): Record<string, any> {
  const arr = dotConfigPath.split('.');
  arr.splice(arr.length - 1, 1);

  if (arr.length === 0) return cfg;

  return arr.reduce((currPth, attName, idx, arr) => {
    const isArray = idx < arr.length && !isNaN(+arr[idx + 1]);
    return currPth[attName] || (currPth[attName] = isArray ? [] : {});
  }, cfg);
}
