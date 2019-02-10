The universeOS
-----------------
The universeOS is a Project which tries to give users the possibility to "share a desktop" with friends, co-workers or like-minded person.


Website: http://www.universeOS.org
Twitter: https://twitter.com/universeos


Install
-------

1. Clone this repo including the frontend submodules
`git clone https://gitlab.com/creators-of-the-universe/universe_node.git --recursive`

2. Install dependencies
`cd universe_node && npm install`

3. Install the frontend dependencies and build frontend
`cd universe_frontend && npm install && npm run build && cd ..`

4. Seed Database
`npm install sequelize -g
sequelize db:migrate
sequelize db:seed:all`