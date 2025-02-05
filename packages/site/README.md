# Coti Snap Companion DApp

## Description

This is a complementary decentralized application (DApp) for Coti Snap. It provides additional functionalities and enhancements for the user experience.

## Installation

1. Clone the repository:
  ```bash
  git clone https://github.com/protofire/coti-snap.git
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

1. if you are in the monorepo, go to the site folder
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

## Once the snap is in production

1. Go to `src/config/snap.ts` and change the url to the url where the snap is hosted.
2. Go to `src/config/wagmi.ts` and change `CONNECTOR_ID` to `metamask.io` to use regular MM instead of MM Flask.
3. Go to `src/components/Header/HeaderButtons.tsx` and delete the Flask conditional:
```
  {!isFlask && !installedSnap ? (
    <InstallFlaskButton />
  ) : (
```

## Contribution

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/new-feature`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push your changes (`git push origin feature/new-feature`).
5. Open a Pull Request.
