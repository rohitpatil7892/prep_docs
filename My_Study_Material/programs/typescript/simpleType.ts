type user1 = {
    name: string
}

type tmp1 = user1 & { role: string } // this is intersection
type status = 1 | 2   // This is union
