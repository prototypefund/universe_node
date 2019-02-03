Database Structure
==================


Users
------
id, type, name, password_id, key_id, last_activity
sequelize model:generate --name User --attributes id:integer,type:string,name:string,password_id:int,key_id:int,last_activity:date
sequelize seed:generate --name seed-user



Passwords
---------
id, algorithm, salt, password
sequelize model:generate --name Password --attributes algorithm:string,salt:string,password:string
sequelize seed:generate --name seed-password


Keys
----
id, type, public_key, secret_key, signature

sequelize model:generate --name Key --attributes type:string,public_key:string,secret_key:string,signature:string

sequelize seed:generate --name seed-key

Group Members (this table sucks->FILE!)
---------------------------------------
group_id, user_id


Buddylist (this table sucks->FILE!)
-----------------------------------
user_id, buddy_id


Directories
-------------------------
id, parent_directory_id, name, owner, privacy

model:generate --name Directory --attributes id:integer, parent_directory_id:integer, name:string,owner:integer,privacy:string
sequelize seed:generate --name seed-directory


Collections
-----------
id, directory_id, owner, privacy

Files
-----
id, collection_id, name, privacy



Migrations:
sequelize db:migrate
sequelize db:seed:all

down:
sequelize db:migrate:undo:all

