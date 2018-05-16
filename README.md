# Claimants Service

This simple Express JS RESTful service performs CRUD operations for a claimant as well as validating a claimant's driving licence (if the person has one).

The project uses MongoDB with the use of Mongoose and makes use of Sinon, Nock and Chai-Http.

## Endpoints

The following endpoints are exposed:

| Method        | Path                      | Purpose                                    |
| ------------- | ------------------------- | ------------------------------------------ |
| GET           | /api/claimants            | Retrieves all claimants                    |
| GET           | /api/claimants/:id        | Retrieves a claimant by their ID           |
| GET           | /api/claimants/nino/:nino | Retrieves a claimant by unique reference   |
| POST          | /api/claimants            | Creates a claimant                         |
| PUT           | /api/claimants/:id        | Updates a claimant using their ID          |
| DEL           | /api/claimants/:id        | Deletes a claimant using their ID          |

## Pre-Requisites

For this project to run you need to install Node. To do so please visit the Node website: https://nodejs.org/en/download/

This project also makes use of MongoDB. You can either:

* Download it here: https://www.mongodb.com/download-center?jmp=nav#atlas
* Or use the MLab DaaS hosted service: https://mlab.com/

## Getting Started

Once you have checked out the project to a directory of your liking, simply run the following command to download the relevant dependencies:

```
npm install
```

## Dependencies

In summary here are a list of the dependencies used within this project (for further details please refer to the __package.json__ file.):

* [Express JS](https://expressjs.com/)
* [Mongoose](http://mongoosejs.com/)
* [Body-Parser](https://www.npmjs.com/package/body-parser)
* [Morgan](https://github.com/expressjs/morgan)
* [Passport JS](http://www.passportjs.org/)
* [JsonWebToken](https://github.com/auth0/node-jsonwebtoken)
* ...

For Testing:

* [Mocha](https://mochajs.org/)
* [Chai](http://www.chaijs.com/)
* [Chai-Http](https://github.com/chaijs/chai-http)
* [Sinon](http://sinonjs.org/)
* [Dirty-Chai](https://www.npmjs.com/package/dirty-chai) - to allow for expectations to be functions for linting purposes
* ...

For code coverage the __nyc__ module has been integrated.

## Running Tests

To run the *unit* tests simply use the following command:

```
npm run unit
```

To run the *integration* tests simply use the following command:

```
npm run integration
```

To run both *unit* and *integration* tests:

```
npm test
```

## Linting

Airbnb's [Config](https://www.npmjs.com/package/eslint-config-airbnb) has been used and to run lint you can use the following command:

```
npm run lint
```

NB: Linting has been configured to run as part of the *npm test* command.