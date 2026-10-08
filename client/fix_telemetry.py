import re

with open('src/pages/OperationsLivePage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix setTelemetry mapping
old_telemetry = r'''              if \(arr\.length > 0\) \{
                const latest = arr\[0\];
                setTelemetry\(\{
                  powerVoltage: latest\?\.robot\?\.powerVoltage,
                  motorTempLeft: latest\?\.sensor\?\.motors\?\.tempLeft,
                  motorTempRight: latest\?\.sensor\?\.motors\?\.tempRight,
                  imu: latest\?\.sensor\?\.imu,
                  gas: latest\?\.sensor\?\.gas,
                  environment: latest\?\.environment,
                  hardware: latest\?\.sensor\?\.hardware,
                  raw: latest
                \}\);
              \}'''

new_telemetry = r'''              if (arr.length > 0) {
                const latest = arr[0];
                setTelemetry({
                  powerVoltage: latest?.robot?.powerVoltage,
                  powerCurrent: latest?.robot?.powerCurrent,
                  motors: latest?.motors,
                  imu: latest?.imu,
                  gas: latest?.gas,
                  environment: latest?.environment,
                  hardware: latest?.hardware,
                  sourceMode: latest?.sourceMode || 'OFFLINE',
                  raw: latest
                });
              }'''

content = re.sub(old_telemetry, new_telemetry, content, flags=re.DOTALL)

with open('src/pages/OperationsLivePage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed setTelemetry mapping')
