import { join } from 'path';
import * as mergeYaml from 'merge-yaml';

const YAML_BASE_CONFIG_FILENAME = 'config/setting.yaml';
const YAML_ENV_CONFIG_FILENAME = `config/setting.${
  process.env.NODE_ENV || 'development'
}.yaml`;

// https://stackoverflow.com/questions/63462577/how-to-load-multiple-yaml-files-at-once-in-javascript
export default () => {
  const files = [YAML_BASE_CONFIG_FILENAME, YAML_ENV_CONFIG_FILENAME].map(
    (file) => join(__dirname, file),
  );

  try {
    return mergeYaml(files) as Record<string, any>;
  } catch (err) {
    console.log('--- merge configuration files err ---');
    console.error(err);
  }
};
