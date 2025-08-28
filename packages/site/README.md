# COTI Snap Companion DApp

A complementary dApp for COTI Snap. It provides additional functionality and enhancements for the user experience.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/coti-io/coti-snap.git
```

2. Navigate to the project directory:

```bash
cd coti-snap
```

3. Install the dependencies:

```bash
yarn install
```

## Usage

1. Start the application:

```bash
yarn start
```

2. Open your browser and navigate to `http://localhost:8000`.

## Deployment

### Resources

The minimum resources to run the dApp itself are:

- 1 CPU
- 1 GB RAM
- 1.5 GB disk space

### Prepare dapp to deploy

1. From the root of the repo, go to the site folder

```bash
  cd packages/site
```

2. Run the following command to build:

```bash
  yarn build
```

3. This will create the `/dist` folder in the root of the project.

4. Follow the steps of your deployer of choice ([Vercel](https://vercel.com/docs/getting-started-with-vercel), [Netlify](https://docs.netlify.com/), etc).

5. If you are going to continue with the monorepo, remember to set the dapp is in `packages/site`.

## Production Use

1. Create a `.env.local` file (copy from `.env.example`) and set `VITE_NODE_ENV=mainnet` to use the npm package snap.
2. Go to `src/config/wagmi.ts` and change `CONNECTOR_MM` from `CONNECTOR_MM_FLASK` to `CONNECTOR_MM_REGULAR` to use regular MM instead of MM Flask.

