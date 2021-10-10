export interface OfferPayload {
    linkId: string;
    offer: RTCSessionDescriptionInit;
}
export interface AnswerPayload {
    linkId: string;
    answer: RTCSessionDescriptionInit;
}
export interface CandidatePayload {
    linkId: string;
    candidate: RTCIceCandidate;
}
