installera
node.js
npm
npm install -g ts-node
npm install -g expo-cli

cd database
npm install
cd ../server
npm install
cd ../client
npm install
cd ..
**glöm inte att ändra till din egna ipadress i de filer som använder 192.168.0.116**
cd database
npx ts-node db.ts
cd ../server
npx ts-node server.ts
**en till terminal**
cd ../client
npx expo start

**om någonting saknas i package.json se över dessa** 
**för database-mappen**
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3 @types/node
**för clientmappen**
npm install
npm install --save-dev typescript
**för servermappen**
npm install express cors
npm install --save-dev @types/express @types/cors typescript ts-node
