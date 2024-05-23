import { SCUtils } from "@/SocialConnect/sc";
import { useSocialConnect } from "@/SocialConnect/useSocialConnect";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useWalletClient } from "wagmi";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

export default function SocialConnectUI({ isOpen, closeModal }: Props) {
  const { data: walletClient } = useWalletClient();
  const { account, lookupAddress, register, revoke } = useSocialConnect();

  const [odisRegistedAddresses, setOdisRegistedAddresses] = useState("");

  const { data: session } = useSession();

  const getLookupAddress = useCallback(async () => {
    const addresses = await SCUtils.lookupAddress(
      "2348108850572",
      walletClient
    );
    // const addresses = await lookupAddress((session as any)?.username);
    console.log("🚀 getLookupAddress ~ addresses:", addresses);

    if (addresses) {
      setOdisRegistedAddresses(addresses);
    } else {
      setOdisRegistedAddresses("");
    }
  }, [lookupAddress, session]);

  const registerUser = async () => {
    console.log("Before register");
    await SCUtils.register("2348108850572", walletClient);
    console.log("After register");
    // await register((session as any)?.username);
    await getLookupAddress();
  };

  const revokeReg = async () => {
    console.log("Before revoke");
    await SCUtils.revoke("2348108850572", walletClient);
    console.log("After revoke");
    await getLookupAddress();
  };

  // useEffect(() => {
  //   if (session) {
  //     getLookupAddress();
  //   }
  // }, [session]);

  if (!isOpen) {
    return <div>Not open o</div>;
  }

  return (
    <>
      <div className="flex flex-col w-[60%] bg-cyan-100 rounded-xl p-4">
        <p className="text-lg font-medium leading-6 text-gray-900">
          Manage Social Connect
        </p>

        <div className={"bg-pink-200 p-2"}>
          <Button title={"Register user"} onClick={registerUser} />
          <Button title={"Revoke Username"} onClick={revokeReg} />
          <Button title={"Lookup"} onClick={getLookupAddress} />
        </div>

        <div className="mt-2">
          {odisRegistedAddresses ? (
            <p>
              You are already registered with Social Connect using following
              details.
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Your Username is not registered with Social Connect. Please
              register your username with Social Connect to use it in the app.
            </p>
          )}

          {session && (
            <div className="text-sm text-gray-500 mt-5">
              <p>
                Username:
                <span className="text-black font-bold">
                  {(session as any)?.username}
                </span>
              </p>
              <p>
                Address:
                <span className="text-black font-bold">
                  {account?.substring(0, 5)}...
                  {account?.substring(account.length - 5, account.length)}
                </span>
              </p>
              <p>
                Provider:
                <span className="text-black font-bold">
                  {process.env.NEXT_PUBLIC_SOCIAL_CONNECT_PROVIDER ===
                    "GITHUB" && "Github"}
                </span>
              </p>
            </div>
          )}
          {session && odisRegistedAddresses === "" && (
            <Button title={"Register Username"} onClick={registerUser} />
          )}
          {session && odisRegistedAddresses !== "" && (
            <Button title={"Revoke Username"} onClick={revokeReg} />
          )}
        </div>

        <div className="mt-4 w-full flex justify-between">
          <Button
            title={!session ? "Sign in with Github" : "Sign Out"}
            onClick={() => {
              if (!session) {
                signIn();
              } else {
                signOut();
              }
            }}
          />
          <Button title={"Close"} onClick={closeModal} />
        </div>
      </div>
    </>
  );
}

function Button(params: { title: string; onClick: VoidFunction }) {
  return (
    <button
      onClick={params.onClick}
      type="button"
      className={`mt-3 text-white font-medium bg-slate-600
                text-sm px-5 py-2.5 rounded-lg
                text-center inline-flex items-center  mr-2 mb-2`}
    >
      {params.title}
    </button>
  );
}
