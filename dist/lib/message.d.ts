export interface IMessage<TypeType = string, PayloadType = any> {
    type: TypeType;
    payload: PayloadType;
}
export interface ITracedMessage<TypeType = string, PayloadType = any> extends IMessage<TypeType, PayloadType> {
    id: string;
}
