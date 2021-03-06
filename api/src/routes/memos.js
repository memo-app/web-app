// src / routes / user.js
'use strict';

// Imports
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const isEmpty = require('lodash/isEmpty');

// App Imports
const config = require('./../config');
let Memo = require('../models/memo');
require('../authentication/jwt');

// Common Routes
let memoRoutes = express.Router();

// Authentication middleware
memoRoutes.use(passport.authenticate('jwt', { session: false }));

// Memos (GET /memos)
memoRoutes.get('/', (request, response) => {
        let responseData = {
            success: false,
            data: {},
            errors: []
        };

        Memo.find({ userId: request.user._id })
            .sort('-createdAt').exec(function (error, documents) {
                if (documents.length > 0) {
                    responseData.data = documents;
                    responseData.success = true;
                }

                response.json(responseData);
            });
    });

// Memos by category (GET /memos/category/category-name
memoRoutes.get('/category/:category', (request, response) => {
    let responseData = {
        success: false,
        data: {},
        errors: []
    };

    Memo.find({ userId: request.user._id, categories: request.params.category })
        .sort('-createdAt').exec(function (error, documents) {
            responseData.data = documents;
            responseData.success = true;

            response.json(responseData);
        })
});

// Memo Add (POST /memos/)
memoRoutes.post('/', (request, response) => {
    let responseData = {
        success: false,
        data: {},
        errors: []
    };

    if (!isEmpty(request.user)) {
        if (request.body.title != '' && request.body.link) {
            let memo = {
                link: request.body.link,
                title: request.body.title,
                categories: request.body.categories ?
                    request.body.categories.map(c => c.toLowerCase()) : [],
                description: request.body.description,
                thumbnails: request.body.thumbnails,
                userId: request.user._id,
                createdAt: new Date()
            };

            Memo.create(memo, (error, document) => {
                if (error) {
                    responseData.errors.push({ type: 'critical', message: error });
                } else {
                    let memoId = document._id;

                    if (memoId) {
                        responseData.data.memoId = memoId;
                        responseData.success = true;
                    } else {
                        responseData.errors.push({ type: 'default', message: 'Please try again.' });
                    }
                }

                response.json(responseData);
            });
        } else {
            responseData.errors.push({ type: 'warning', message: 'Supply memo link and title.' });

            response.json(responseData);
        }
    } else {
        responseData.errors.push({ type: 'critical', message: 'You are not signed in. Please sign in to post a memo.' });

        response.json(responseData);
    }
});

// Search Memos (GET /memos/search?query=123)
memoRoutes.get('/search', (request, response) => {
    let responseData = {
        success: false,
        data: {},
        errors: []
    };

    if (request.query.query) {

        Memo.find({
            userId: request.user._id,
            $text: {
                $search: request.query.query,
                $language: "english",
                $caseSensitive: false,
                $diacriticSensitive: false
            }
        },
            { score: { $meta: "textScore" } })
            .sort({ score: { $meta: 'textScore' } })
            .skip(request.query.offset || 0)
            .limit(request.query.limit || 10)
            .exec(function (error, results) {
                if (error) {
                    responseData.errors.push(error);
                    response.status(400).send(responseData);
                } else {
                    responseData.success = true;
                    responseData.data = results;
                    response.json(responseData);
                }
            });
    } else {
        responseData.errors.push({ type: 'warning', message: 'No search term supplied' });
        response.json(responseData);
    }
});


// Single Memo (GET /memos/id)
memoRoutes.get('/:memoId', (request, response) => {
    let responseData = {
        success: false,
        data: {},
        errors: []
    };

    if (request.params.memoId) {
        Memo.find({ _id: request.params.memoId }).exec(function (error, documents) {
            if (documents && documents.length > 0) {
                responseData.data = documents[0];
                responseData.success = true;
            }

            response.json(responseData);
        });
    } else {
        response.json(responseData);
    }
});

// Delete Memo (DELETE /memos/id)
memoRoutes.delete('/:memoId', (request, response) => {
    let responseData = {
        success: false,
        data: {},
        errors: []
    };

    Memo.remove({ userId: request.user._id, _id: request.params.memoId }, error => {
        if (error) {
            responseData.errors.push(error.message);
            response.status(400).send(responseData);
        } else {
            responseData.success = true;
            response.send(responseData);
        }
    })
})

// Export
module.exports = memoRoutes;