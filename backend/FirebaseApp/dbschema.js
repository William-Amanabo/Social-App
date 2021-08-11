let db = {

    users: {
        userId: "123456789867654",
        email: 'USER@EMAIL.COM',
        handle: 'user',
        createdAt: '2019-03-15T10:59:52.798Z',
        imageUrl: 'image/qwdfghjhgfdsa.png',
        bio: 'hello nice to meet you',
        website: 'https://user.com',
        location: 'London, UK'
    },
    screams: [{
        userHandle: "user",
        body: "this is the scram body",
        createdAt: "2020-03-20T15:03:11.656Z",
        likeCount: 5,
        commentCount: 2,
        screamId:'2345678909876',
    }],
    comments: [{
        userHandle: 'user',
        screamId: '2345678909876',
        body: 'nice to meet you mate!',
        createdAt: "2020-03-20T15:03:11.656Z"
    }],
    notifications: [{

    }]
};

const userDetails ={
    //redux data
    credentials:{
        userId: '1234567ertyu45678io',
        email: 'user@gmail.com',
        handle:'user',
        createdAt: '2019-03-15T10:59:52.798Z',
        imageUrl:'image/asdfgfdsasdfghgfdsasdfg',
        bio: 'Hello , my name is user',
        website: 'https://user.com',
        location:'London Uk'
    },
    Likes:[
        {
            userHandle:'user',
            screamId:'1234567tresasertgyhj',

        },
        {
            userHandle:'user',
            screamId:'qwertyui123456678890',   
        }
    ]
}