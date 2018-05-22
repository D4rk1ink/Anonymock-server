import * as chai from 'chai'
import * as db from '../test-db'
import * as test from './auth.test'
import { Server } from '../../app'
import { User } from '../../app/models/user'

const should = chai.should()
const expect = chai.expect
chai.use(require('chai-http'))

describe('Auth', () => {

    let server: Server

    beforeEach((done) => {
        db.dropDatabase()
        server = Server.bootstrap()
        setTimeout(done, 1500)
    })

    afterEach(() => {
        server.close()
        server = null
    })

    describe('Sign-up', () => {
        it('should success when email or username not eixst', (done) => {
            chai.request(server.app)
                .post('/api/auth/signup')
                .send(test.newUser)
                .end((err, res) => {
                    res.body.should.have.property('data')
                    res.body.should.not.have.property('errors')
                    res.body.data.should.have.property('username').eql(test.newUser.username)
                    res.body.data.should.have.property('email').eql(test.newUser.email)
                    res.should.have.status(200)
                    done()
                })
        })

        // it('should error when email or username eixst', (done) => {
        //     User.create(test.newUser).then(() => {
        //         chai.request(server.app)
        //             .post('/api/auth/signup')
        //             .send(test.duplicateUser)
        //             .end((err, res) => {
        //                 console.log(res.body)
        //                 res.body.should.have.property('errors')
        //                 res.should.have.status(200)
        //                 done()
        //             })
        //     })
        // })
    })

    // describe('Sign-in', () => {
    //     it('should success when username and password are valid', (done) => {
    //         User.create(test.newUser)
    //         chai.request(server.app)
    //             .post('/api/auth/signin')
    //             .send(test.validUser)
    //             .end((err, res) => {
    //                 res.should.have.status(200)
    //             })
    //         done()
    //     })

    //     it('should status 401 when username or password are invalid', (done) => {
    //         User.create(test.newUser)
    //         chai.request(server.app)
    //             .post('/api/auth/signin')
    //             .send(test.invalidUser)
    //             .end((err, res) => {
    //                 res.should.have.status(401)
    //             })
    //         done()
    //     })
    // })
})