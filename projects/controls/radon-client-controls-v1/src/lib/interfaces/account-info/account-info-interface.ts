export interface AccountInfoInterface {
    account_id: string,
    name: string,
    phrase_chain: string,
    settings: {
        static_receiving: boolean,
        sending_iterator: number
    },
    sending_address: {
        priv_key: string,
        pub_key: string
    },
    receiving_address: {
        priv_key: string,
        pub_key: string
    },
    created?:number
}
