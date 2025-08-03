getUsers(function (a) {
    getUserName(a, function (b) {
        getUserEmail(b, function (c) {
            getUserAddress(c, function (d) {
                console.log(d);
            })
        })
    })
})

// solution using promises
getUsers()
    .then(a => getUserName(a))
    .then(b => getUserEmail(b))
    .then(c => getUserAddress(c))
    .then(d => console.log(d))
    .catch(e => console.log(e))

// solution using async/await
async function getUserDetails() {
    try {
        let a = await getUsers();
        let b = await getUserName(a);
        let c = await getUserEmail(b);
        let d = await getUserAddress(c);
        console.log(d);
    } catch (error) {
        console.log(error);
    }
}

getUserDetails();