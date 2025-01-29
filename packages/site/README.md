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

## Once the snap is in production

1. Go to `src/config/snap.ts` and change the url to the url where the snap is hosted.
2. Go to `src/config/wagmi.ts` and change `CONNECTOR_ID` to `metamask.io` to use regular MM instead of regular MM.
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
