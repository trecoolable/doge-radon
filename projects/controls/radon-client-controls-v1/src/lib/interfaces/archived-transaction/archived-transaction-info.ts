export interface ArchivedTransactionInfo {
    account_id: string,
    direction: string,
    txid: string,
    amount: number,
    memo: string,
    meta: object,
    created?: number,
    created_id?: number,
}
