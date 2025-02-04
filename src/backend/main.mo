import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";

actor ChatAnalyzer {
    // Store chat data by user principal
    private var chats = HashMap.HashMap<Principal, Text>(0, Principal.equal, Principal.hash);

    // Store chat analysis results
    private var analyses = HashMap.HashMap<Principal, Text>(0, Principal.equal, Principal.hash);

    // Save chat data
    public shared(msg) func saveChat(data: Text) : async Bool {
        let caller = msg.caller;
        chats.put(caller, data);
        Debug.print("Chat saved for user: " # Principal.toText(caller));
        true
    };

    // Get chat data
    public shared(msg) func getChat() : async ?Text {
        let caller = msg.caller;
        chats.get(caller)
    };

    // Save analysis results
    public shared(msg) func saveAnalysis(analysis: Text) : async Bool {
        let caller = msg.caller;
        analyses.put(caller, analysis);
        Debug.print("Analysis saved for user: " # Principal.toText(caller));
        true
    };

    // Get analysis results
    public shared(msg) func getAnalysis() : async ?Text {
        let caller = msg.caller;
        analyses.get(caller)
    };

    // Clear user data
    public shared(msg) func clearData() : async Bool {
        let caller = msg.caller;
        chats.delete(caller);
        analyses.delete(caller);
        Debug.print("Data cleared for user: " # Principal.toText(caller));
        true
    };
}