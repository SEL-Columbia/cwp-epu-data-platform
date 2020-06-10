# cwp-epu-data-platform
Columbia World Projects Energy for Productive Use Data Platform

Live page: https://qsel.columbia.edu/cwp-epu-data-platform/

## Development
### Installation
- Install [Node.js](https://nodejs.org/)
- Navigate to this directory in your terminal, and run `npm start`
- Open a browser and navigate to: `http://localhost:8080`

### Contributing
- All application files are located in the `./src` directory
- To modify how vector layers are displayed, edit `./src/config/vectors.js`

### Deployment
- Assets will automatically be built, minified, and saved to `/dist` on every commit (via a git pre-commit hook)
- Pushing to the `master` branch will automatically trigger a deployment to the live Github Pages site
