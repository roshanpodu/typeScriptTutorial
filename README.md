# script-ticket-73263

## Usage

### Development / Testing
This script uses jest as the testing library.
It expects that an ".env" file is set in the project folder containing the following content:
```
LEANIX_HOST = "<your workspace host, e.g. app.leanix.net>"
LEANIX_APITOKEN = "<your apitoken>"
```

### CLI Tool
The project installs a command line interface tool that can be run using the following command:
```
git clone https://github.com/leanix-public/script-zendesk-ticket-73263.git
cd script-zendesk-ticket-73263
npx cli73263 --host <your workspace host> --apitoken <your api token>
```

Additional usage information on the tool can be obtained by executing the following command:
```
npx cli73263 --help
```


