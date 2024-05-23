import { LookupResponse } from "@/pages/api/socialconnect/lookup";
import { IdentifierPrefix } from "@celo/identity/lib/odis/identifier";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";

// const { data: walletClient } = useWalletClient();
// const { address } = useAccount();

export class SCUtils {
  // This code defines a function that returns an identifier prefix based on the value of an environment variable.
  static getIdentifierPrefix() {
    if (process.env.NEXT_PUBLIC_SOCIAL_CONNECT_PROVIDER === "TWITTER") {
      return IdentifierPrefix.TWITTER;
    } else if (process.env.NEXT_PUBLIC_SOCIAL_CONNECT_PROVIDER === "GITHUB") {
      return IdentifierPrefix.TWITTER;
    }
    return IdentifierPrefix.TWITTER;
  }

  /**
   * Looks up the address associated with the given identifier by making a GET request
   * to the "/api/socialconnect/lookup" endpoint with the identifier and its type as query
   * parameters. Returns the first account in the response if there is any. Uses the
   * getIdentifierPrefix() function to determine the identifier type.
   *
   * @param identifier The identifier to look up the address for.
   * @returns The first account in the response, or undefined if there is none.
   */
  static async lookupAddress(identifier: string, walletClient: any) {
    if (walletClient) {
      let response: Response = await fetch(
        `/api/socialconnect/lookup?${new URLSearchParams({
          handle: identifier,
          identifierType: SCUtils.getIdentifierPrefix(),
        })}`,
        {
          method: "GET",
        }
      );

      let lookupResponse: LookupResponse = await response.json();
      if (lookupResponse.accounts.length > 0) {
        return lookupResponse.accounts[0];
      }
    }
  }

  /**
   * Registers the given identifier for the current wallet client by making a POST request
   * to the "/api/socialconnect/register" endpoint with the account address, identifier, and
   * identifier type as the request body. Returns true if the registration is successful,
   * false otherwise. Uses the getIdentifierPrefix() function to determine the identifier type.
   *
   * @param identifier The identifier to register.
   * @returns True if the registration is successful, false otherwise.
   */
  static async register(identifier: string, walletClient: any) {
    if (walletClient) {
      try {
        let response = await fetch("/api/socialconnect/register", {
          method: "POST",
          body: JSON.stringify({
            account: walletClient?.account.address,
            identifier: identifier,
            identifierType: this.getIdentifierPrefix(),
          }),
        });

        let registerResponse = await response.json();

        if (registerResponse.error) {
          console.error(registerResponse.error);
          return false;
        }
        return true;
      } catch (error: any) {
        console.error(error.message);
        return false;
      } finally {
      }
    }
  }

  /**
   * Revokes the given identifier for the current wallet client by making a POST request
   * to the "/api/socialconnect/revoke" endpoint with the account address, identifier, and
   * identifier type as the request body. Uses the getIdentifierPrefix() function to determine
   * the identifier type. If the response contains an error, logs it to the console.
   *
   * @param identifier The identifier to revoke.
   */
  static async revoke(identifier: string, walletClient: any) {
    if (walletClient) {
      try {
        let response = await fetch("/api/socialconnect/revoke", {
          method: "POST",
          body: JSON.stringify({
            account: walletClient?.account.address,
            identifier: identifier,
            identifierType: this.getIdentifierPrefix(),
          }),
        });

        let deregisterResponse = await response.json();
        if (deregisterResponse.error) {
          console.error(deregisterResponse.error);
        }
      } catch (error: any) {
        console.error(error.message);
      }
    }
  }
}
