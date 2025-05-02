import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { TokenList } from "@/components/TokenList";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getUserTokens } from "@/utils/get-user-tokens"; 
import { 
  TOKEN_PROGRAM_ID, 
  TOKEN_2022_PROGRAM_ID,
 } from "@solana/spl-token";

export default function UserTokens({
  isWalletConnected,
  disconnect,
  setIsWalletConnected,
  loading,
}: {
  isWalletConnected: boolean;
  disconnect: () => void;
  setIsWalletConnected: (isWalletConnected: boolean) => void;
  loading: boolean;
}) {

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [solBalance, setSolBalance] = useState<number | null>(null);
  useEffect(() => {
    const fetchSolBalance = async () => {
      if (publicKey) {
        const lamports = await connection.getBalance(publicKey);
        setSolBalance(lamports / 1e9); 
      }
    };
    fetchSolBalance();
  }, [publicKey, connection]);  

  const [tokens, setTokens] = useState<{ mint: string; amount: number; decimals: number }[]>([]);
  useEffect(() => {
    const loadTokens = async () => {
      if (publicKey) {
        try {
          const standardTokens = await getUserTokens(connection, publicKey, TOKEN_PROGRAM_ID);
          const token2022 = await getUserTokens(connection, publicKey, TOKEN_2022_PROGRAM_ID);
          const combined = [...standardTokens, ...token2022];
          setTokens(combined);
        } catch (error) {
          console.error("Error fetching tokens:", error);
        }
      }
    };
    loadTokens();
  }, [publicKey, connection]);  

  return (
    <TabsContent value="userTokens">
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Your Tokens</CardTitle>
            <CardDescription>View your tokens.</CardDescription>
          </div>
          {isWalletConnected ? (
            <div>
              <Button
                onClick={() => {
                  try {
                    disconnect();
                    //refetch();
                    setIsWalletConnected(false);
                  } catch (e) {
                    console.log("Error disconnecting", e);
                  }
                }}
              >
                Disconnect
              </Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isWalletConnected ? (
              <div className="text-center py-8">
                <p className="mb-4 text-muted-foreground">
                  Connect your wallet to view your tokens
                </p>
                <WalletMultiButton style={{ backgroundColor: "black" }}>
                  <Button asChild disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <div>Connect Wallet</div>
                    )}
                  </Button>
                </WalletMultiButton>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground break-all">
                  <strong>Wallet Address:</strong> {publicKey?.toBase58()}
                </div>
                <div>
                  <strong>SOL Balance:</strong>{" "}
                  {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : "Loading..."}
                </div>
                <div className="mb-4">
                  <TokenList tokens={tokens} />
                </div>         
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
