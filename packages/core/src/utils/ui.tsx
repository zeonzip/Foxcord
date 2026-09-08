import type { ReactNode } from "react";
import { StyleManager } from "@/webpack/discord/style.ts";
import styles from "./ui.css";

interface ContainerProps {
	children: ReactNode;
}

export function Container({ children }: ContainerProps) {
	StyleManager.addStyle("native-ui-styles", styles);

	return <div className={"fc-container"}>{children}</div>;
}
