interface user {
    name: string
    role: string
    phone: number
}

interface user2 extends user {
    add: string
}

interface emp {
    id: number
    emp: user
}

interface emp2{
    id: number
    emp: user2
}


const empRecords : emp = {
    id: 1,
    emp: {
        name: 'Rohit',
        role: 'SE',
        phone: 12345
    }
} 


const empRecords2 : emp2 = {
    id: 1,
    emp: {
        name: 'Rohit',
        role: 'SE',
        phone: 12345,
        add: "something"
    }
} 
